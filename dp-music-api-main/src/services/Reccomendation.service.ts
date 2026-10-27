import axios from "axios";
import { RECOMMENDER_API_ENDPOINT } from "../config/recomender";
import { TrackModel } from "../database/models/track.model";

export class RecommendationService {
  // Registered once per API process; reset on failure so the next call retries
  // (e.g. if the recommender wasn't up yet).
  private catalogRegistration: Promise<void> | null = null;

  constructor() {
    this.getPlaylistSummary = this.getPlaylistSummary.bind(this);
    this.getPlaylistExplained = this.getPlaylistExplained.bind(this);
    this.evaluate = this.evaluate.bind(this);
    this.ensureCatalog = this.ensureCatalog.bind(this);
  }

  // The recommender indexes far more tracks than this app stores; telling it
  // our catalog makes it return only tracks we can actually show.
  async ensureCatalog(): Promise<void> {
    if (!this.catalogRegistration) {
      this.catalogRegistration = (async () => {
        const trackIds = await TrackModel.distinct("track_id");

        await axios.put(RECOMMENDER_API_ENDPOINT + "/catalog", { trackIds });
      })().catch((error) => {
        this.catalogRegistration = null;
        throw error;
      });
    }

    return this.catalogRegistration;
  }

  async getPlaylistSummary(trackIds: string[], topN?: number) {
    await this.ensureCatalog();

    const { data } = await axios.post(
      RECOMMENDER_API_ENDPOINT + "/playlist/recommendation/summary",
      {
        trackIds,
        topN,
      }
    );

    return data;
  }

  async getPlaylistExplained(trackIds: string[], topN?: number) {
    await this.ensureCatalog();

    const { data } = await axios.post(
      RECOMMENDER_API_ENDPOINT + "/playlist/recommendation/explained",
      { trackIds, topN }
    );

    return data;
  }

  async evaluate(playlists: string[][], k = 10) {
    const { data } = await axios.post(
      RECOMMENDER_API_ENDPOINT + "/evaluation",
      { playlists, k },
      { timeout: 120000 }
    );

    return data;
  }
}

export const recommendationService = new RecommendationService();
