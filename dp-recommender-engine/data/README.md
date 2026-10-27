# Dataset

This service expects the Kaggle **"Spotify 1 Million Tracks"** dataset:

https://www.kaggle.com/datasets/amitanshjoshi/spotify-1million-tracks

## Setup

1. Download `spotify_data.csv` from the Kaggle page above (requires a free
   Kaggle account; via UI download or the `kaggle datasets download` CLI).
2. Run the normalizer, which lowercases columns, drops the stray pandas
   index column Kaggle ships, and writes the file this service reads:

   ```bash
   python scripts/prepare_dataset.py /path/to/spotify_data.csv
   ```

   This produces `data/spotify_dataset.csv` (path controlled by
   `DATASET_PATH` in `.env`).

## Expected columns

The dataset (and this service) matches the field set documented in the
thesis, table 2.1 — this is not a coincidence, it's the same dataset the
thesis's Jupyter prototype was built against:

`artist_name, track_name, track_id, popularity, year, genre, danceability,
energy, key, loudness, mode, speechiness, acousticness, instrumentalness,
liveness, valence, tempo, duration_ms, time_signature`

`track_id` is the Spotify track id — this is the key shared with
`dp-music-api-main`'s Mongo `Track` collection (`track_id` field), so no
other id mapping is needed between the two services.

## Note on scale

The raw dataset has ~1.1M rows. Loading and indexing all of them is
unnecessary for a course/demo-scale deployment and would make the service
slow to start and slow to query. `MAX_TRACKS` (default 150,000) caps the
indexed catalogue via a popularity-weighted, genre-stratified sample (see
`app/recommender.py: _stratified_sample`) so genre diversity is preserved
instead of just keeping whatever the first N rows happen to be.
