import { NextFunction, Request, Response } from "express";
import { PlaylistInterface } from "../types/interface/Playlist.interface";
import { playlistRecord } from "../database/active-records/playlist.record";
import { recommendationService } from "../services/Reccomendation.service";
import { trackRecord } from "../database/active-records/track.record";
import { BadRequestError } from "../errors/bad-request-error";

const RECOMMENDED_PLAYLIST_SEED_SIZE = 20;
const RECOMMENDED_PLAYLIST_TRACK_COUNT = 40;

async function assertOwner(
  request: Request,
  playlistId: string,
  response: Response
): Promise<boolean> {
  // @ts-ignore
  const { id: userId } = request?.jwt?.user || {};

  if (!userId) {
    response.status(400).json({ error: "User not found" });

    return false;
  }

  const ownerId = await playlistRecord.getOwnerId(playlistId);

  if (!ownerId) {
    response.status(404).json({ error: "Playlist not found" });

    return false;
  }

  if (ownerId !== userId) {
    response.status(403).json({ error: "Not allowed" });

    return false;
  }

  return true;
}

export class PlaylistController {
  async getAllPlaylists(request: Request, response: Response): Promise<void> {
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};

    if (!userId) {
      response.status(200).json({ data: [] });

      return;
    }

    const playlists = await playlistRecord.getAllPlaylists(userId);

    response.status(200).json({ data: playlists });
  }

  async getRecommendationSummary(
    request: Request,
    response: Response
  ): Promise<void> {
    const { id: playlistId } = request.params;

    const playlist = await playlistRecord.getPlaylistById(playlistId);
    const tracks = playlist.tracks.map((track: any) => track.track_id);

    const explanations = await recommendationService.getPlaylistExplained(tracks);
    const explanationById = new Map(
      explanations.map((explanation: any) => [explanation.trackId, explanation])
    );

    const recommendedTracks = await trackRecord.getTracksBySpotifyIds(
      explanations.map((explanation: any) => explanation.trackId)
    );

    const tracksWithExplanation = recommendedTracks
      .map((track: any) => ({
        ...track,
        explanation: explanationById.get(track.track_id) || null,
      }))
      .sort(
        (a: any, b: any) =>
          (b.explanation?.score ?? -1) - (a.explanation?.score ?? -1)
      );

    response.status(200).json({ data: tracksWithExplanation });
  }

  async getPlaylistById(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    const playlist = await playlistRecord.getPlaylistById(id);

    response.status(200).json({ data: playlist });
  }

  async createPlaylist(request: Request, response: Response): Promise<void> {
    const { playlist } = request.body as { playlist: PlaylistInterface };
    const { name } = playlist;

    // @ts-ignore
    const { jwt } = request || {};

    const { id } = jwt?.user || {};

    if (!id) {
      response.status(400).json({ error: "User not found" });

      return;
    }

    const createdPlaylist = await playlistRecord.createPlaylist({
      name,
      tracks: [],
      owner: id,
    });

    response.status(200).json({ createdPlaylist });
  }

  async createRecommendedPlaylist(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    const { name, genres } = request.body as {
      name?: string;
      genres: string[];
    };

    // @ts-ignore
    const { jwt } = request || {};
    const { id: userId } = jwt?.user || {};

    if (!userId) {
      response.status(400).json({ error: "User not found" });

      return;
    }

    const seedTracks = await trackRecord.getSampleTracksByGenres(
      genres || [],
      RECOMMENDED_PLAYLIST_SEED_SIZE
    );

    if (!seedTracks.length) {
      return next(
        new BadRequestError("No tracks found for the selected genres")
      );
    }

    const seedTrackIds = seedTracks.map((track: any) => track.track_id);

    const recommendedSpotifyIds = await recommendationService.getPlaylistSummary(
      seedTrackIds,
      RECOMMENDED_PLAYLIST_TRACK_COUNT
    );

    const recommendedTracks = await trackRecord.getTracksBySpotifyIds(
      recommendedSpotifyIds
    );

    const createdPlaylist = await playlistRecord.createPlaylist({
      name: name || "Made for you",
      tracks: recommendedTracks.map((track: any) => track._id),
      owner: userId,
      genres: genres || [],
    });

    response.status(201).json({ createdPlaylist });
  }

  async addTrackToPlaylist(
    request: Request,
    response: Response
  ): Promise<void> {
    const { id } = request.params;
    const { trackId } = request.body as { trackId: any };

    if (!(await assertOwner(request, id, response))) {
      return;
    }

    const updatedPlaylist = await playlistRecord.addTrackToPlaylist(
      id,
      trackId
    );

    response.status(200).json({ updatedPlaylist });
  }

  async removeTrackFromPlaylist(
    request: Request,
    response: Response
  ): Promise<void> {
    const { id } = request.params;
    const { trackId } = request.body as { trackId: any };

    if (!(await assertOwner(request, id, response))) {
      return;
    }

    const updatedPlaylist = await playlistRecord.removeTrackFromPlaylist(
      id,
      trackId
    );

    response.status(200).json({ updatedPlaylist });
  }

  async deletePlaylist(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    if (!(await assertOwner(request, id, response))) {
      return;
    }

    await playlistRecord.deletePlaylist(id);

    response.status(200).json({ id });
  }
}
