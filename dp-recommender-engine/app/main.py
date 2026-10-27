import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .recommender import DatasetNotReadyError, recommender
from .routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recommender")

app = FastAPI(
    title="DP Music Recommender Engine",
    description=(
        "Content-based track recommendation service (TF-IDF + cosine "
        "similarity over audio features and metadata). Consumed by "
        "dp-music-api-main's RecommendationService."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def on_startup() -> None:
    try:
        recommender.load()
    except DatasetNotReadyError as exc:
        # Don't crash the process: /health will report not_ready and the
        # dataset can be dropped in and the service restarted.
        logger.warning("Recommender not ready: %s", exc)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=False)
