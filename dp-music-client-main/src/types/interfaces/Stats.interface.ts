export interface AdGenreStatInterface {
  genre: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

export interface UserStatsInterface {
  summary: {
    totalPlays: number;
    uniqueTracks: number;
    topGenre: string | null;
    playlistsCount: number;
    playlistTracksCount: number;
    adImpressions: number;
    adClicks: number;
    ctr: number;
    estimatedRevenue: number;
  };
  playsByDay: { date: string; plays: number }[];
  playsByGenre: { genre: string; plays: number }[];
  playlistGenres: { genre: string; tracks: number }[];
  topTracks: {
    id: string;
    trackName: string;
    artistName: string;
    genre: string;
    trackCover?: string;
    artists: { name: string }[];
    durationMs?: number;
    plays: number;
  }[];
  adsByBrand: { brand: string; impressions: number; clicks: number }[];
  adsByGenre: AdGenreStatInterface[];
}

export interface PlatformAdStatsInterface {
  model: { adChance: number; minRevenue: number; maxRevenue: number };
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  byGenre: AdGenreStatInterface[];
}

export interface AbTestGroupInterface {
  variant: "targeted" | "random";
  users: number;
  impressions: number;
  clicks: number;
  ctr: number;
  ciLow: number;
  ciHigh: number;
  revenue: number;
  since: string | null;
}

export interface AbTestInterface {
  yourGroup: "targeted" | "random";
  since: string | null;
  groups: [AbTestGroupInterface, AbTestGroupInterface];
  pooledCtr: number;
  zScore: number | null;
  pValue: number | null;
  lift: number | null;
  alpha: number;
  power: number;
  minimumDetectableLift: number;
  baselineCtr: number;
  requiredPerGroup: number;
  verdict: "insufficient_data" | "significant" | "not_significant";
}

export interface StatsResponseInterface {
  user: UserStatsInterface;
  platformAds: PlatformAdStatsInterface;
  abTest: AbTestInterface;
}

export interface EvaluationVariantInterface {
  id: "blend" | "text" | "audio" | "popularity" | "random";
  label: string;
  hitRate: number;
  precision: number;
  ndcg: number;
  mrr: number;
  genrePrecision: number;
  ild: number;
  novelty: number;
  coverage: number;
}

export interface RecommenderEvaluationInterface {
  k: number;
  cases: number;
  playlists: number;
  catalogSize: number;
  computedAt: number;
  variants: EvaluationVariantInterface[];
}
