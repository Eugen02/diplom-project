import { PlayHistoryModel } from "../models/playHistory.model";
import { enrichTrackWithMetadata } from "./track.record";

export class PlayHistoryRecord {
  async logPlay(userId: string, trackId: string, genre?: string): Promise<any> {
    const entry = await PlayHistoryModel.create({
      user: userId,
      track: trackId,
      genre: genre || "unknown",
    });

    return entry;
  }

  async getRecentlyPlayed(userId: string, limit: number): Promise<any> {
    const entries = await PlayHistoryModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 3) // over-fetch, then dedupe by track below
      .populate("track")
      .exec();

    const seenTrackIds = new Set<string>();
    const uniqueTracks: any[] = [];

    for (const entry of entries as any[]) {
      const track = entry.track;

      if (!track) {
        continue;
      }

      const trackId = track._id.toString();

      if (seenTrackIds.has(trackId)) {
        continue;
      }

      seenTrackIds.add(trackId);
      uniqueTracks.push(track);

      if (uniqueTracks.length >= limit) {
        break;
      }
    }

    return Promise.all(
      uniqueTracks.map((track: any) => enrichTrackWithMetadata(track))
    );
  }
}

export const playHistoryRecord = new PlayHistoryRecord();
