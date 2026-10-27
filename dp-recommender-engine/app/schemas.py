from typing import List, Optional

from pydantic import BaseModel, Field


class PlaylistRecommendationRequest(BaseModel):
    """Mirrors the body sent by RecommendationService.getPlaylistSummary
    in dp-music-api-main (POST /playlist/recommendation/summary)."""

    trackIds: List[str] = Field(default_factory=list)
    topN: Optional[int] = Field(default=None, ge=1, le=100)


class FeatureContribution(BaseModel):
    feature: str
    contribution: float


class RecommendationExplanation(BaseModel):
    trackId: str
    score: Optional[float]
    textScore: Optional[float]
    audioScore: Optional[float]
    topTerms: List[FeatureContribution]
    topAudioFeatures: List[FeatureContribution]


class CatalogRequest(BaseModel):
    trackIds: List[str] = Field(default_factory=list)


class EvaluationRequest(BaseModel):
    playlists: List[List[str]] = Field(default_factory=list)
    k: int = Field(default=10, ge=1, le=50)
    maxCases: int = Field(default=200, ge=1, le=1000)


class HealthResponse(BaseModel):
    status: str
    tracksIndexed: int
    datasetPath: str
