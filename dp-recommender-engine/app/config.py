from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8006

    dataset_path: Path = ROOT_DIR / "data" / "spotify_dataset.csv"
    artifacts_dir: Path = ROOT_DIR / "data" / "artifacts"

    max_tracks: int = 150_000
    default_top_n: int = 20


settings = Settings()
