import logging
from typing import List

from fastapi import APIRouter, HTTPException, Query

from .recommender import DatasetNotReadyError, recommender
from .schemas import (
    CatalogRequest,
    EvaluationRequest,
    HealthResponse,
    PlaylistRecommendationRequest,
    RecommendationExplanation,
)

logger = logging.getLogger("recommender")

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if recommender.is_ready else "not_ready",
        tracksIndexed=len(recommender.track_ids),
        datasetPath=str(recommender.dataset_path),
    )


@router.post("/playlist/recommendation/summary", response_model=List[str])
async def playlist_recommendation_summary(
    payload: PlaylistRecommendationRequest,
) -> List[str]:
    """Contract consumed by dp-music-api-main's RecommendationService:
    given the Spotify track ids already in a playlist, return a flat list
    of Spotify track ids to recommend. The Node service looks these up in
    Mongo by `track_id`, so unknown ids returned here are simply ignored
    downstream."""

    try:
        return recommender.recommend_for_playlist(payload.trackIds, top_n=payload.topN)
    except DatasetNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post(
    "/playlist/recommendation/explained",
    response_model=List[RecommendationExplanation],
)
async def playlist_recommendation_explained(
    payload: PlaylistRecommendationRequest,
) -> List[dict]:
    """Same recommendations as /summary, each with its cosine score split
    into text/audio parts and the features that contributed most."""

    try:
        return recommender.recommend_explained_for_playlist(
            payload.trackIds, top_n=payload.topN
        )
    except DatasetNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.put("/catalog")
def catalog(payload: CatalogRequest) -> dict:
    """Registers the consuming app's track ids so recommendations only
    return tracks the app can display. Persisted across restarts."""

    try:
        return recommender.set_catalog(payload.trackIds)
    except DatasetNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/evaluation")
def evaluation(payload: EvaluationRequest) -> dict:
    # Sync def: FastAPI runs it in a worker thread, so a multi-second
    # evaluation doesn't block other requests on the event loop.
    try:
        return recommender.evaluate(
            payload.playlists, k=payload.k, max_cases=payload.maxCases
        )
    except DatasetNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/track/{track_id}/recommendation", response_model=List[str])
async def track_recommendation(
    track_id: str, limit: int = Query(default=20, ge=1, le=100)
) -> List[str]:
    """Bonus endpoint (thesis section 1: "recommendations for a track").
    Not currently called by dp-music-api-main, but exposed for future wiring
    without requiring any change on this service."""

    try:
        return recommender.recommend_for_track(track_id, top_n=limit)
    except DatasetNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
