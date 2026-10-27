"""Content-based track recommender.

Implements the approach described in the thesis (chapter 2.1): tracks are
represented as a blend of a TF-IDF text profile (track name / artist / genre)
and a normalised numeric audio-feature profile, and recommendations are
produced via cosine similarity between a "taste profile" vector and the
track catalogue.

Two deliberate upgrades over the thesis's original Jupyter prototype:

1. Instead of materialising a full N x N cosine-similarity matrix (which is
   ~O(n^2) memory/time and does not scale past a few tens of thousands of
   rows), a `sklearn.neighbors.NearestNeighbors` index with cosine metric is
   fit once and queried per request in O(n) time and O(1) extra memory.
2. The text block and the numeric block are each L2-normalised before being
   concatenated and weighted, so neither block silently dominates the
   similarity score (a common bug in naive TF-IDF + raw-scaled-numeric
   concatenations).
"""

from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path
from typing import Iterable, List, Optional

import joblib
import numpy as np
import pandas as pd
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler, normalize

from .config import settings

logger = logging.getLogger("recommender")

TEXT_COLUMNS = ["track_name", "artist_name", "genre"]
NUMERIC_COLUMNS = [
    "danceability",
    "energy",
    "key",
    "loudness",
    "mode",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
    "duration_ms",
    "popularity",
]

TEXT_WEIGHT = 0.55
NUMERIC_WEIGHT = 0.45

# Bump when the cached state's shape changes so stale artifacts get rebuilt.
CACHE_VERSION = 2

EVALUATION_VARIANTS = [
    ("blend", "TF-IDF + audio (production)"),
    ("text", "TF-IDF text only"),
    ("audio", "Audio features only"),
    ("popularity", "Most popular (baseline)"),
    ("random", "Random (baseline)"),
]


class DatasetNotReadyError(RuntimeError):
    pass


class ContentBasedRecommender:
    def __init__(
        self,
        dataset_path: Path = settings.dataset_path,
        artifacts_dir: Path = settings.artifacts_dir,
        max_tracks: int = settings.max_tracks,
    ) -> None:
        self.dataset_path = Path(dataset_path)
        self.artifacts_dir = Path(artifacts_dir)
        self.max_tracks = max_tracks

        self.track_ids: List[str] = []
        self.id_to_index: dict[str, int] = {}
        self.popularity_rank: List[int] = []  # row indices sorted by popularity desc
        self.matrix: Optional[sparse.csr_matrix] = None
        self.nn: Optional[NearestNeighbors] = None
        self.feature_names: List[str] = []
        self.numeric_columns: List[str] = []
        self.text_dim: int = 0
        self.genres: np.ndarray = np.array([])
        self.popularity: np.ndarray = np.array([])
        self._normalized: dict[str, sparse.csr_matrix] = {}
        # Rows the consuming app can actually show (its own track catalog).
        # When set, recommendations are drawn only from these rows.
        self.catalog_mask: Optional[np.ndarray] = None

    # ------------------------------------------------------------------ #
    # Loading / building
    # ------------------------------------------------------------------ #
    @property
    def is_ready(self) -> bool:
        return self.matrix is not None and self.nn is not None

    def load(self, force_rebuild: bool = False) -> None:
        if not self.dataset_path.exists():
            raise DatasetNotReadyError(
                f"Dataset not found at {self.dataset_path}. "
                "See data/README.md for how to obtain the Kaggle "
                "'Spotify 1 Million Tracks' CSV and where to place it."
            )

        cache_key = self._cache_key()
        if not force_rebuild and self._load_from_cache(cache_key):
            logger.info("Loaded recommender index from cache (%d tracks)", len(self.track_ids))
        else:
            logger.info("Building recommender index from %s", self.dataset_path)
            df = self._read_and_prepare_dataset()
            self._fit(df)
            self._save_to_cache(cache_key)
            logger.info("Recommender index built (%d tracks)", len(self.track_ids))

        self._load_catalog()

    # ------------------------------------------------------------------ #
    # App catalog restriction
    # ------------------------------------------------------------------ #
    @property
    def _catalog_path(self) -> Path:
        return self.artifacts_dir / "catalog.json"

    def set_catalog(self, track_ids: Iterable[str]) -> dict:
        if not self.is_ready:
            raise DatasetNotReadyError("Recommender index has not been built yet")

        ids = list(dict.fromkeys(tid for tid in track_ids if tid))
        self._apply_catalog(ids)

        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self._catalog_path.write_text(json.dumps(ids))

        return {"received": len(ids), "indexed": int(self.catalog_mask.sum())}

    def _apply_catalog(self, ids: List[str]) -> None:
        mask = np.zeros(len(self.track_ids), dtype=bool)
        for tid in ids:
            idx = self.id_to_index.get(tid)
            if idx is not None:
                mask[idx] = True
        self.catalog_mask = mask if mask.any() else None

    def _load_catalog(self) -> None:
        if not self._catalog_path.exists():
            return
        try:
            self._apply_catalog(json.loads(self._catalog_path.read_text()))
            logger.info(
                "Restricting recommendations to app catalog (%d tracks)",
                int(self.catalog_mask.sum()) if self.catalog_mask is not None else 0,
            )
        except Exception:  # pragma: no cover - a bad catalog file shouldn't block startup
            logger.exception("Failed to load app catalog, recommending from full index")

    def _cache_key(self) -> str:
        stat = self.dataset_path.stat()
        raw = (
            f"{self.dataset_path}|{stat.st_size}|{stat.st_mtime_ns}|"
            f"{self.max_tracks}|v{CACHE_VERSION}"
        )
        return hashlib.sha1(raw.encode()).hexdigest()[:16]

    def _artifact_paths(self, cache_key: str) -> dict:
        base = self.artifacts_dir / cache_key
        return {
            "manifest": base.with_suffix(".manifest.json"),
            "state": base.with_suffix(".joblib"),
        }

    def _load_from_cache(self, cache_key: str) -> bool:
        paths = self._artifact_paths(cache_key)
        if not paths["manifest"].exists() or not paths["state"].exists():
            return False

        try:
            state = joblib.load(paths["state"])
            self.track_ids = state["track_ids"]
            self.id_to_index = state["id_to_index"]
            self.popularity_rank = state["popularity_rank"]
            self.matrix = state["matrix"]
            self.nn = state["nn"]
            self.feature_names = state["feature_names"]
            self.numeric_columns = state["numeric_columns"]
            self.text_dim = state["text_dim"]
            self.genres = state["genres"]
            self.popularity = state["popularity"]
            self._normalized = {}
            return True
        except Exception:  # pragma: no cover - defensive against corrupt cache
            logger.exception("Failed to load cached recommender index, rebuilding")
            return False

    def _save_to_cache(self, cache_key: str) -> None:
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        paths = self._artifact_paths(cache_key)

        joblib.dump(
            {
                "track_ids": self.track_ids,
                "id_to_index": self.id_to_index,
                "popularity_rank": self.popularity_rank,
                "matrix": self.matrix,
                "nn": self.nn,
                "feature_names": self.feature_names,
                "numeric_columns": self.numeric_columns,
                "text_dim": self.text_dim,
                "genres": self.genres,
                "popularity": self.popularity,
            },
            paths["state"],
        )
        paths["manifest"].write_text(
            json.dumps(
                {
                    "dataset_path": str(self.dataset_path),
                    "tracks": len(self.track_ids),
                    "max_tracks": self.max_tracks,
                }
            )
        )

    # ------------------------------------------------------------------ #
    # Dataset preparation
    # ------------------------------------------------------------------ #
    def _read_and_prepare_dataset(self) -> pd.DataFrame:
        df = pd.read_csv(self.dataset_path, low_memory=False)
        df.columns = [c.strip().lower() for c in df.columns]

        required = {"track_id", "track_name", "artist_name"}
        missing = required - set(df.columns)
        if missing:
            raise DatasetNotReadyError(
                f"Dataset is missing required columns: {sorted(missing)}. "
                "See data/README.md for the expected schema."
            )

        df = df.dropna(subset=["track_id", "track_name", "artist_name"])
        df["track_id"] = df["track_id"].astype(str)
        df = df.drop_duplicates(subset="track_id", keep="first")

        for col in TEXT_COLUMNS:
            if col not in df.columns:
                df[col] = ""
            df[col] = df[col].fillna("").astype(str)

        available_numeric = [c for c in NUMERIC_COLUMNS if c in df.columns]
        for col in available_numeric:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].fillna(df[col].median())
        self._numeric_columns = available_numeric

        if len(df) > self.max_tracks:
            df = self._stratified_sample(df, self.max_tracks)

        return df.reset_index(drop=True)

    def _stratified_sample(self, df: pd.DataFrame, size: int) -> pd.DataFrame:
        """Keep genre diversity while favouring popular tracks, instead of a
        blind `.head(n)` / uniform random sample."""

        if "genre" not in df.columns or df["genre"].nunique() <= 1:
            sort_col = "popularity" if "popularity" in df.columns else df.columns[0]
            return df.sort_values(sort_col, ascending=False).head(size)

        sort_col = "popularity" if "popularity" in df.columns else "genre"
        df = df.sort_values(sort_col, ascending=False)

        genre_counts = df["genre"].value_counts(normalize=True)
        parts = []
        for genre, share in genre_counts.items():
            quota = max(1, int(round(size * share)))
            parts.append(df[df["genre"] == genre].head(quota))

        sampled = pd.concat(parts).drop_duplicates(subset="track_id")
        return sampled.head(size)

    # ------------------------------------------------------------------ #
    # Feature engineering + index fitting
    # ------------------------------------------------------------------ #
    def _fit(self, df: pd.DataFrame) -> None:
        corpus = (
            df["track_name"] + " " + df["artist_name"] + " " + df["genre"]
        ).str.strip()

        vectorizer = TfidfVectorizer(
            max_features=20000,
            ngram_range=(1, 2),
            sublinear_tf=True,
        )
        text_matrix = vectorizer.fit_transform(corpus)  # already L2-normalised rows

        numeric_cols = getattr(self, "_numeric_columns", [])
        if numeric_cols:
            scaler = MinMaxScaler()
            numeric_scaled = scaler.fit_transform(df[numeric_cols].to_numpy())
            numeric_scaled = normalize(numeric_scaled, norm="l2")
            numeric_matrix = sparse.csr_matrix(numeric_scaled)
        else:
            numeric_matrix = sparse.csr_matrix((len(df), 0))

        combined = sparse.hstack(
            [text_matrix * TEXT_WEIGHT, numeric_matrix * NUMERIC_WEIGHT],
            format="csr",
        )

        nn = NearestNeighbors(metric="cosine", algorithm="brute", n_jobs=-1)
        nn.fit(combined)

        self.track_ids = df["track_id"].tolist()
        self.id_to_index = {tid: i for i, tid in enumerate(self.track_ids)}
        if "popularity" in df.columns:
            self.popularity_rank = (
                df["popularity"].astype(float).to_numpy().argsort()[::-1].tolist()
            )
        else:
            self.popularity_rank = list(range(len(df)))
        self.matrix = combined
        self.nn = nn
        self.feature_names = vectorizer.get_feature_names_out().tolist()
        self.numeric_columns = list(numeric_cols)
        self.text_dim = text_matrix.shape[1]
        self.genres = df["genre"].to_numpy(dtype=str)
        self.popularity = (
            df["popularity"].astype(float).to_numpy()
            if "popularity" in df.columns
            else np.zeros(len(df))
        )
        self._normalized = {}

    # ------------------------------------------------------------------ #
    # Querying
    # ------------------------------------------------------------------ #
    def recommend_for_playlist(
        self, track_ids: Iterable[str], top_n: Optional[int] = None
    ) -> List[str]:
        if not self.is_ready:
            raise DatasetNotReadyError("Recommender index has not been built yet")

        top_n = top_n or settings.default_top_n
        input_ids = [tid for tid in track_ids if tid]
        known_indices = [self.id_to_index[tid] for tid in input_ids if tid in self.id_to_index]

        if not known_indices:
            return self._popularity_fallback(exclude=set(input_ids), top_n=top_n)

        profile = np.asarray(self.matrix[known_indices].mean(axis=0))
        exclude = set(input_ids)
        return self._query(profile, exclude, top_n, extra_candidates=len(known_indices))

    def recommend_for_track(self, track_id: str, top_n: Optional[int] = None) -> List[str]:
        if not self.is_ready:
            raise DatasetNotReadyError("Recommender index has not been built yet")

        top_n = top_n or settings.default_top_n
        idx = self.id_to_index.get(track_id)
        if idx is None:
            return self._popularity_fallback(exclude={track_id}, top_n=top_n)

        profile = np.asarray(self.matrix[idx].todense())
        return self._query(profile, {track_id}, top_n, extra_candidates=1)

    def _query(
        self,
        profile: np.ndarray,
        exclude: set[str],
        top_n: int,
        extra_candidates: int,
    ) -> List[str]:
        if self.catalog_mask is not None:
            return self._query_catalog(profile, exclude, top_n)

        n_samples = self.matrix.shape[0]
        n_neighbors = min(n_samples, top_n + extra_candidates + 10)

        distances, indices = self.nn.kneighbors(profile.reshape(1, -1), n_neighbors=n_neighbors)

        results: List[str] = []
        for idx in indices[0]:
            tid = self.track_ids[idx]
            if tid in exclude or tid in results:
                continue
            results.append(tid)
            if len(results) >= top_n:
                break

        if len(results) < top_n:
            results.extend(
                tid
                for tid in self._popularity_fallback(exclude | set(results), top_n - len(results))
                if tid not in results
            )

        return results[:top_n]

    def _query_catalog(
        self, profile: np.ndarray, exclude: set[str], top_n: int
    ) -> List[str]:
        """Exact cosine ranking restricted to the app catalog. A k-NN query
        can't filter, so score every row (one sparse mat-vec, ~ms) instead."""

        matrix = self._normalized_matrix("blend")
        profile = np.asarray(profile).ravel()
        norm = np.linalg.norm(profile)
        scores = matrix.dot(profile / norm) if norm else np.zeros(matrix.shape[0])

        scores[~self.catalog_mask] = -np.inf
        for tid in exclude:
            idx = self.id_to_index.get(tid)
            if idx is not None:
                scores[idx] = -np.inf

        candidates = min(top_n, int(np.isfinite(scores).sum()))
        if candidates:
            top = np.argpartition(-scores, candidates - 1)[:candidates]
            top = top[np.argsort(-scores[top])]
            results = [self.track_ids[i] for i in top]
        else:
            results = []

        if len(results) < top_n:
            results.extend(
                self._popularity_fallback(exclude | set(results), top_n - len(results))
            )

        return results[:top_n]

    def _popularity_fallback(self, exclude: set[str], top_n: int) -> List[str]:
        results: List[str] = []
        for idx in self.popularity_rank:
            if self.catalog_mask is not None and not self.catalog_mask[idx]:
                continue
            tid = self.track_ids[idx]
            if tid in exclude or tid in results:
                continue
            results.append(tid)
            if len(results) >= top_n:
                break
        return results

    # ------------------------------------------------------------------ #
    # Explainability
    # ------------------------------------------------------------------ #
    def _feature_name(self, column: int) -> str:
        if column < self.text_dim:
            return self.feature_names[column]
        return self.numeric_columns[column - self.text_dim]

    def explain(
        self,
        seed_ids: Iterable[str],
        candidate_ids: Iterable[str],
        top_terms: int = 3,
        top_audio: int = 3,
    ) -> List[dict]:
        """Decomposes cos(u, v) between the playlist profile u and each
        candidate v into per-feature contributions c_j = u_j·v_j / (‖u‖·‖v‖),
        which sum exactly to the cosine. Text columns sum to textScore,
        audio columns to audioScore."""

        if not self.is_ready:
            raise DatasetNotReadyError("Recommender index has not been built yet")

        known = [self.id_to_index[tid] for tid in seed_ids if tid in self.id_to_index]
        profile = (
            np.asarray(self.matrix[known].mean(axis=0)).ravel() if known else None
        )
        profile_norm = float(np.linalg.norm(profile)) if profile is not None else 0.0

        explanations: List[dict] = []
        for tid in candidate_ids:
            idx = self.id_to_index.get(tid)

            if idx is None or not profile_norm:
                explanations.append(
                    {
                        "trackId": tid,
                        "score": None,
                        "textScore": None,
                        "audioScore": None,
                        "topTerms": [],
                        "topAudioFeatures": [],
                    }
                )
                continue

            row = self.matrix[idx]
            row_norm = float(np.sqrt(row.multiply(row).sum()))
            columns = row.indices
            contributions = row.data * profile[columns] / (profile_norm * row_norm)

            is_text = columns < self.text_dim
            text_order = np.argsort(-contributions[is_text])[:top_terms]
            audio_order = np.argsort(-contributions[~is_text])[:top_audio]

            explanations.append(
                {
                    "trackId": tid,
                    "score": float(contributions.sum()),
                    "textScore": float(contributions[is_text].sum()),
                    "audioScore": float(contributions[~is_text].sum()),
                    "topTerms": [
                        {
                            "feature": self._feature_name(int(columns[is_text][i])),
                            "contribution": float(contributions[is_text][i]),
                        }
                        for i in text_order
                        if contributions[is_text][i] > 0
                    ],
                    "topAudioFeatures": [
                        {
                            "feature": self._feature_name(int(columns[~is_text][i])),
                            "contribution": float(contributions[~is_text][i]),
                        }
                        for i in audio_order
                        if contributions[~is_text][i] > 0
                    ],
                }
            )

        return explanations

    def recommend_explained_for_playlist(
        self, track_ids: Iterable[str], top_n: Optional[int] = None
    ) -> List[dict]:
        seed_ids = [tid for tid in track_ids if tid]
        recommended = self.recommend_for_playlist(seed_ids, top_n=top_n)
        return self.explain(seed_ids, recommended)

    # ------------------------------------------------------------------ #
    # Offline evaluation
    # ------------------------------------------------------------------ #
    def _normalized_matrix(self, variant: str) -> sparse.csr_matrix:
        if variant not in self._normalized:
            if variant == "text":
                block = self.matrix[:, : self.text_dim]
            elif variant == "audio":
                block = self.matrix[:, self.text_dim :]
            else:
                block = self.matrix
            self._normalized[variant] = normalize(block.tocsr(), norm="l2")
        return self._normalized[variant]

    def _top_k(
        self, variant: str, seeds: List[int], k: int, rng: np.random.Generator
    ) -> List[int]:
        seed_set = set(seeds)

        if variant == "popularity":
            return [i for i in self.popularity_rank if i not in seed_set][:k]

        if variant == "random":
            picks = rng.choice(len(self.track_ids), size=k + len(seeds), replace=False)
            return [int(i) for i in picks if int(i) not in seed_set][:k]

        matrix = self._normalized_matrix(variant)
        profile = np.asarray(matrix[seeds].mean(axis=0)).ravel()
        scores = matrix.dot(profile)
        scores[seeds] = -np.inf
        candidates = np.argpartition(-scores, k)[:k]
        return candidates[np.argsort(-scores[candidates])].tolist()

    def evaluate(
        self,
        playlists: List[List[str]],
        k: int = 10,
        max_cases: int = 200,
        seed: int = 42,
    ) -> dict:
        """Leave-one-out: for every playlist with >= 3 indexed tracks, hide
        one track, build the profile from the rest, and check whether the
        hidden track comes back in the top-k."""

        if not self.is_ready:
            raise DatasetNotReadyError("Recommender index has not been built yet")

        rng = np.random.default_rng(seed)
        blend = self._normalized_matrix("blend")

        cases = []
        used_playlists = 0
        for playlist in playlists:
            indices = list(
                dict.fromkeys(
                    self.id_to_index[tid] for tid in playlist if tid in self.id_to_index
                )
            )
            if len(indices) < 3:
                continue
            used_playlists += 1
            for held_out in indices:
                cases.append((held_out, [i for i in indices if i != held_out]))

        if len(cases) > max_cases:
            chosen = rng.choice(len(cases), size=max_cases, replace=False)
            cases = [cases[i] for i in chosen]

        results = []
        for variant, label in EVALUATION_VARIANTS:
            hits = precision = ndcg = rr = genre_precision = ild = novelty = 0.0
            recommended_items: set[int] = set()

            for held_out, seeds in cases:
                top = self._top_k(variant, seeds, k, rng)
                recommended_items.update(top)

                if held_out in top:
                    rank = top.index(held_out) + 1
                    hits += 1
                    precision += 1 / k
                    ndcg += 1 / np.log2(rank + 1)
                    rr += 1 / rank

                seed_genres = {self.genres[i] for i in seeds}
                genre_precision += sum(self.genres[i] in seed_genres for i in top) / k

                vectors = blend[top]
                similarity = vectors.dot(vectors.T).toarray()
                pairs = len(top) * (len(top) - 1)
                if pairs:
                    ild += (pairs - (similarity.sum() - np.trace(similarity))) / pairs

                novelty += float(
                    np.mean(-np.log2((self.popularity[top] + 1) / 101))
                )

            n = len(cases) or 1
            results.append(
                {
                    "id": variant,
                    "label": label,
                    "hitRate": hits / n,
                    "precision": precision / n,
                    "ndcg": ndcg / n,
                    "mrr": rr / n,
                    "genrePrecision": genre_precision / n,
                    "ild": ild / n,
                    "novelty": novelty / n,
                    "coverage": len(recommended_items) / len(self.track_ids),
                }
            )

        return {
            "k": k,
            "cases": len(cases),
            "playlists": used_playlists,
            "catalogSize": len(self.track_ids),
            "variants": results,
        }


recommender = ContentBasedRecommender()
