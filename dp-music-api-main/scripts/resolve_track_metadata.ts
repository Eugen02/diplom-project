/**
 * One-off batch job: walks the entire Track collection and resolves cover
 * art + preview audio (via Deezer) for every track that doesn't have it yet,
 * persisting the result on the track document.
 *
 * Safe to stop and re-run at any time - it only ever touches tracks still
 * missing trackCover, so progress is never lost. Preview URLs are not stored
 * (Deezer signs them with a ~15 min expiry); only the stable deezerId is.
 *
 * Usage (from dp-music-api-main/):
 *   npx ts-node scripts/resolve_track_metadata.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { TrackModel } from "../src/database/models/track.model";
import { getSpotifyTrackInfo } from "../src/utils/getSpotifyTrackInfo";

dotenv.config();

const BATCH_SIZE = 200;
const CONCURRENCY = 4;

const resolveBatch = async (tracks: any[]): Promise<number> => {
  let resolved = 0;
  let cursor = 0;

  const worker = async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;

      if (index >= tracks.length) {
        return;
      }

      const track = tracks[index];

      const { trackCover, artists, deezerId } = await getSpotifyTrackInfo(
        track.artist_name,
        track.track_name
      );

      await TrackModel.findByIdAndUpdate(track._id, {
        trackCover,
        artists,
        deezerId,
      });

      resolved += 1;

      if (resolved % 50 === 0) {
        console.log(`  resolved ${resolved}/${tracks.length} in this batch`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  return resolved;
};

const main = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not set");
  }

  await mongoose.connect(mongoUrl);

  const totalMissing = await TrackModel.countDocuments({
    trackCover: { $exists: false },
  });

  console.log(`Tracks missing metadata: ${totalMissing}`);

  let totalResolved = 0;

  for (;;) {
    const tracks = await TrackModel.find({
      trackCover: { $exists: false },
    })
      .limit(BATCH_SIZE)
      .select("_id artist_name track_name");

    if (!tracks.length) {
      break;
    }

    const resolved = await resolveBatch(tracks);
    totalResolved += resolved;

    console.log(`Progress: ${totalResolved}/${totalMissing} resolved so far`);
  }

  console.log(`Done. Resolved ${totalResolved} tracks.`);

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error("Batch resolve failed:", error);
  process.exit(1);
});
