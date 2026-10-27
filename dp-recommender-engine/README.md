# dp-recommender-engine

Standalone FastAPI microservice implementing the content-based track
recommender described in the thesis (TF-IDF text profile + normalized audio
features, compared via cosine similarity). It is the `Recommender system` /
`Recommendation API` box in the thesis's component diagram (2.2.3) — a
separate service that `dp-music-api-main` (Core API) calls over HTTP, never
touching the Node app's MongoDB directly.

## Contract with dp-music-api-main

`dp-music-api-main/src/config/recomender.ts` points at
`http://localhost:8006`, and `Reccomendation.service.ts` calls:

```
POST /playlist/recommendation/summary
Body: { "trackIds": string[] }        // Spotify track ids already in the playlist
Response: string[]                    // Spotify track ids to recommend
```

`PlaylistController.getRecommendationSummary` takes the returned ids and
looks them up in Mongo by `track_id`, so this service only needs to agree
on the `track_id` (Spotify id) key with the Node app — it does not need
database access. Nothing in `dp-music-api-main` or `dp-music-client-main`
was changed; this service was built to match their existing code exactly.

An extra `GET /track/{track_id}/recommendation?limit=20` endpoint is also
exposed (same response shape) for the thesis's "recommendations for a
single track" requirement, ready to wire up later even though nothing
currently calls it.

## Why NearestNeighbors instead of a full cosine-similarity matrix

The thesis's Jupyter prototype (2.1.3) computes a full pairwise cosine
similarity matrix over the whole catalogue. That's fine for the ~26k-row
sample used in the notebook, but is O(n^2) memory and compute — completely
infeasible at the dataset's real size (~1.1M tracks: a dense similarity
matrix alone would need ~4.5 TB). This service instead fits a single
`sklearn.neighbors.NearestNeighbors(metric="cosine")` index once at
startup and queries it in ~O(n) per request, which is what the same
scikit-learn primitives are meant for at this scale. See
`app/recommender.py` for the full pipeline (TF-IDF -> MinMax-scaled numeric
features -> L2-normalized + weighted blend -> NearestNeighbors index) and
`data/README.md` for the dataset and the row-cap sampling strategy.

## Running

```bash
python -m venv .venv
.venv/Scripts/activate         # or `source .venv/bin/activate` on Linux/macOS
pip install -r requirements.txt

cp .env.example .env
# follow data/README.md to place data/spotify_dataset.csv

python -m app.main              # serves on :8006, matching recomender.ts
# or: uvicorn app.main:app --host 0.0.0.0 --port 8006
```

First startup builds and caches the TF-IDF/scaler/index artifacts under
`data/artifacts/` (keyed by dataset path+size+mtime), so subsequent
restarts load instantly instead of refitting.

`GET /health` reports whether the index finished building and how many
tracks are indexed — useful for confirming the dataset was picked up
before pointing `dp-music-api-main` at this service.
