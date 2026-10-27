"""Dev-only: generate a small synthetic CSV matching the expected schema,
so the service can be smoke-tested without the real ~1M row Kaggle file."""

import random

import pandas as pd

random.seed(42)

genres = ["rock", "pop", "hip-hop", "edm", "classical", "jazz"]
artists = [f"Artist {i}" for i in range(50)]

rows = []
for i in range(2000):
    genre = random.choice(genres)
    rows.append(
        {
            "artist_name": random.choice(artists),
            "track_name": f"Track {i}",
            "track_id": f"track_{i:05d}",
            "popularity": random.randint(0, 100),
            "year": random.randint(1990, 2024),
            "genre": genre,
            "danceability": random.random(),
            "energy": random.random(),
            "key": random.randint(0, 11),
            "loudness": random.uniform(-30, 0),
            "mode": random.randint(0, 1),
            "speechiness": random.random(),
            "acousticness": random.random(),
            "instrumentalness": random.random(),
            "liveness": random.random(),
            "valence": random.random(),
            "tempo": random.uniform(60, 200),
            "duration_ms": random.randint(120000, 300000),
            "time_signature": 4,
        }
    )

pd.DataFrame(rows).to_csv("data/spotify_dataset.csv", index=False)
print("wrote data/spotify_dataset.csv")
