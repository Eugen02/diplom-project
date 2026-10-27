"""Normalize the raw Kaggle CSV into the shape app/recommender.py expects.

Usage:
    python scripts/prepare_dataset.py /path/to/spotify_data.csv [output_path]
"""

import sys
from pathlib import Path

import pandas as pd

DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "data" / "spotify_dataset.csv"


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    source = Path(sys.argv[1])
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    df = pd.read_csv(source, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]

    for stray in ("unnamed: 0", "index"):
        if stray in df.columns:
            df = df.drop(columns=[stray])

    required = {"track_id", "track_name", "artist_name"}
    missing = required - set(df.columns)
    if missing:
        raise SystemExit(f"Source CSV is missing required columns: {sorted(missing)}")

    output.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output, index=False)
    print(f"Wrote {len(df)} rows to {output}")


if __name__ == "__main__":
    main()
