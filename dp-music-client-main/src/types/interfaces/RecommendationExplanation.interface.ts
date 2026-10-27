export interface FeatureContributionInterface {
  feature: string;
  contribution: number;
}

export interface RecommendationExplanationInterface {
  trackId: string;
  score: number | null;
  textScore: number | null;
  audioScore: number | null;
  topTerms: FeatureContributionInterface[];
  topAudioFeatures: FeatureContributionInterface[];
}
