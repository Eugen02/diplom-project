import { TrackInterface } from "../../types/interface/Track.interface";
import { getSpotifyTrackInfo } from "../../utils/getSpotifyTrackInfo";
import { TrackModel } from "../models/track.model";
import { userRecord } from "./user.record";

interface TrackRecordInterface {
  getRootTracks: () => Promise<any>;
}

export const convertTracksDataToCamelCase = (track: any) => {
  return {
    ...track,
    trackId: track.track_id,
    trackName: track.track_name,
    artistName: track.artist_name,
    timeSignature: track.time_signature,
    durationMs: track.duration_ms,
  };
};

// Resolves cover art / preview audio for a track and persists the result on
// the track document so it only ever has to be looked up once, instead of
// hitting the external API (rate-limited) on every page load.
export const enrichTrackWithMetadata = async (track: any) => {
  const isAlreadyResolved = Boolean(track.trackCover);

  if (isAlreadyResolved) {
    return {
      ...convertTracksDataToCamelCase(track?._doc || track),
      trackCover: track.trackCover,
      artists: track.artists || [],
    };
  }

  const { trackCover, artists, deezerId } = await getSpotifyTrackInfo(
    track.artist_name,
    track.track_name
  );

  await TrackModel.findByIdAndUpdate(track._id, { trackCover, artists, deezerId });

  return {
    ...convertTracksDataToCamelCase(track?._doc || track),
    trackCover,
    artists,
    deezerId,
  };
};

export class TrackRecord implements TrackRecordInterface {
  async getRootTracks(): Promise<any> {
    const tracks = await TrackModel.find({})
      .limit(200)
      .sort({ popularity: -1 });

    const tracksWithSpotifyMetadata = await Promise.all(
      tracks.map((track: any) => enrichTrackWithMetadata(track))
    );

    return tracksWithSpotifyMetadata;
  }

  async getTrackById(id: string): Promise<any> {
    const track = await TrackModel.findById(id);

    return convertTracksDataToCamelCase(track);
  }

  async createTrack(track: TrackInterface): Promise<any> {
    const createdTrack = await TrackModel.create(track);

    return convertTracksDataToCamelCase(createdTrack);
  }

  async like(id: string, userId: string): Promise<any> {
    const track = await TrackModel.findById(id);

    if (!track) {
      throw new Error("Track not found");
    }

    const user = await userRecord.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isTrackAlreadyLiked = user.likedTracks
      .map(({ id }: any) => id)
      .includes(id);

    if (isTrackAlreadyLiked) {
      throw new Error("Track already liked");
    }

    const updatedUser = await userRecord.likeTrack(userId, id);

    return updatedUser;
  }

  async unlike(id: string, userId: string): Promise<any> {
    const track = await TrackModel.findById(id);

    if (!track) {
      throw new Error("Track not found");
    }

    const user = await userRecord.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isTrackAlreadyLiked = user.likedTracks
      .map(({ id }: any) => id.toString())
      .includes(id);

    if (!isTrackAlreadyLiked) {
      throw new Error("Track not liked");
    }

    const updatedUser = await userRecord.unlikeTrack(userId, id);

    return updatedUser;
  }

  async getGenreById(id: string): Promise<string | undefined> {
    const track = await TrackModel.findById(id).select("genre");

    return track?.genre;
  }

  async getSampleTracksByGenres(genres: string[], limit: number): Promise<any> {
    if (!genres?.length) {
      return [];
    }

    const tracks = await TrackModel.aggregate([
      { $match: { genre: { $in: genres } } },
      { $sample: { size: limit } },
    ]);

    return tracks;
  }

  async getTracksBySpotifyIds(spotifyIds: string[]): Promise<any> {
    const tracks = await TrackModel.find({
      track_id: { $in: spotifyIds },
    });

    const tracksWithSpotifyMetadata = await Promise.all(
      tracks.map((track: any) => enrichTrackWithMetadata(track))
    );

    return tracksWithSpotifyMetadata;
  }
}

export const trackRecord = new TrackRecord();
