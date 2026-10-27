"""Seed dp-music-api-main's MongoDB with tracks from the same CSV that
dp-recommender-engine indexes, so track_id values overlap and
recommendations actually resolve to something in the client UI.

This does not touch dp-music-api-main's code at all - it just calls its
existing public POST /api/v1/track endpoint, same as any other client
would.

Usage:
    python seed_tracks.py [count]

    count   how many top-popularity tracks to seed (default 3000)
"""

import csv
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_URL = "http://localhost:9999/api/v1/track"
CSV_PATH = Path(__file__).resolve().parent.parent / "dp-recommender-engine" / "data" / "spotify_dataset.csv"

NUMERIC_FIELDS = [
    "popularity", "year", "danceability", "energy", "key", "loudness",
    "mode", "speechiness", "acousticness", "instrumentalness", "liveness",
    "valence", "tempo", "duration_ms",
]


def load_top_tracks(count: int):
    with CSV_PATH.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    def popularity(row):
        try:
            return float(row.get("popularity") or 0)
        except ValueError:
            return 0.0

    rows.sort(key=popularity, reverse=True)

    seen = set()
    unique_rows = []
    for row in rows:
        track_id = row.get("track_id")
        if not track_id or track_id in seen:
            continue
        seen.add(track_id)
        unique_rows.append(row)
        if len(unique_rows) >= count:
            break

    return unique_rows


def to_track_payload(row: dict) -> dict:
    track = {
        "artist_name": row["artist_name"],
        "track_name": row["track_name"],
        "track_id": row["track_id"],
        "year": int(float(row["year"])) if row.get("year") else 2000,
        "genre": row.get("genre") or "unknown",
    }
    for field in NUMERIC_FIELDS:
        if field in ("year",):
            continue
        value = row.get(field)
        if value not in (None, ""):
            try:
                track[field] = float(value)
            except ValueError:
                pass
    return track


def post_track(track: dict) -> bool:
    body = json.dumps({"track": track}).encode("utf-8")
    request = urllib.request.Request(
        API_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status in (200, 201)
    except urllib.error.HTTPError as exc:
        print(f"  HTTP {exc.code} for {track['track_id']}: {exc.read()[:200]}")
        return False
    except urllib.error.URLError as exc:
        print(f"  connection error for {track['track_id']}: {exc}")
        return False


def main() -> None:
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

    if not CSV_PATH.exists():
        raise SystemExit(f"Dataset not found at {CSV_PATH}")

    rows = load_top_tracks(count)
    print(f"Seeding {len(rows)} tracks into {API_URL} ...")

    ok, failed = 0, 0
    for i, row in enumerate(rows, start=1):
        track = to_track_payload(row)
        if post_track(track):
            ok += 1
        else:
            failed += 1

        if i % 100 == 0 or i == len(rows):
            print(f"  {i}/{len(rows)} (ok={ok}, failed={failed})")

    print(f"Done. ok={ok} failed={failed}")


if __name__ == "__main__":
    main()
