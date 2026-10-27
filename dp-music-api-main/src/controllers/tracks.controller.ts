import { TrackInterface } from "./../types/interface/Track.interface";
import { Request, Response } from "express";
import { TrackModel } from "../database/models/track.model";
import {
  getDeezerPreview,
  getSpotifyTrackInfo,
} from "../utils/getSpotifyTrackInfo";
import { trackRecord } from "../database/active-records/track.record";
import { playHistoryRecord } from "../database/active-records/playHistory.record";
import { adImpressionRecord } from "../database/active-records/adImpression.record";
import {
  getAdCampaignForGenre,
  getRandomAdCampaign,
} from "../constants/adCampaigns";
import {
  AD_IMPRESSION_CHANCE,
  AD_MAX_REVENUE,
  AD_MIN_REVENUE,
  AdVariantEnum,
  getAdVariant,
} from "../constants/adModel";

export class TracksController {
  async getRootTracks(request: Request, response: Response): Promise<void> {
    console.log("ROOOOOOOT 1")
    const tracks = await trackRecord.getRootTracks();
    console.log("ROOOOOOOT 2")

    response.status(200).json({ data: tracks });
  }

  async getGenres(request: Request, response: Response): Promise<void> {
    const genres = await TrackModel.distinct("genre");

    response.status(200).json({ data: genres.sort() });
  }

  async createTrack(request: Request, response: Response): Promise<void> {
    const { track } = request.body as { track: TrackInterface };

    const createdTrack = await trackRecord.createTrack(track);

    response.status(201).json({ createdTrack });
  }

  async getTrackById(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    const track = await trackRecord.getTrackById(id);
    const trackSpotifyMetadata = await getSpotifyTrackInfo(
      track?.artist_name || "",
      track?.track_name || ""
    );

    response.status(200).json({
      track,
      trackSpotifyMetadata,
    });
  }
  async getPreview(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const track = await TrackModel.findById(id).select(
      "artist_name track_name deezerId"
    );

    if (!track) {
      response.status(404).json({ previewUrl: null });

      return;
    }

    const { deezerId, previewUrl } = await getDeezerPreview(
      track.deezerId,
      track.artist_name,
      track.track_name
    );

    if (deezerId && deezerId !== track.deezerId) {
      await TrackModel.findByIdAndUpdate(id, { deezerId });
    }

    response.status(200).json({ previewUrl });
  }

  async logPlay(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};

    if (!userId) {
      response.status(200).json({ ad: null });

      return;
    }

    const genre = await trackRecord.getGenreById(id);

    await playHistoryRecord.logPlay(userId, id, genre);

    const shouldServeAd = Math.random() < AD_IMPRESSION_CHANCE;

    if (!shouldServeAd) {
      response.status(200).json({ ad: null });

      return;
    }

    const variant = getAdVariant(userId);
    const campaign =
      variant === AdVariantEnum.TARGETED
        ? getAdCampaignForGenre(genre)
        : getRandomAdCampaign();
    const estimatedRevenue =
      AD_MIN_REVENUE + Math.random() * (AD_MAX_REVENUE - AD_MIN_REVENUE);

    await adImpressionRecord.logImpression(
      userId,
      campaign.id,
      campaign.brand,
      genre || "unknown",
      estimatedRevenue,
      variant
    );

    response.status(200).json({
      ad: {
        campaignId: campaign.id,
        brand: campaign.brand,
        tagline: campaign.tagline,
        description: campaign.description,
        url: campaign.url,
        genre: genre || "unknown",
      },
    });
  }

  async likeTrack(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};

    if (!id) {
      response.status(400).json({ message: "id is required" });

      return;
    }

    if (!userId) {
      response.status(400).json({ message: "userId is required" });

      return;
    }

    const track = await trackRecord.like(id, userId);

    response.status(200).json({ track });
  }

  async unlikeTrack(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};

    console.log("id [unlikeTrack]", id);
    console.log("userId [unlikeTrack]", userId);

    if (!id) {
      response.status(400).json({ message: "id is required" });

      return;
    }

    if (!userId) {
      response.status(400).json({ message: "userId is required" });

      return;
    }

    const track = await trackRecord.unlike(id, userId);

    response.status(200).json({ track });
  }
}
