import { model, Schema, Model, Document } from "mongoose";
import { addVirtualsToSchema } from "../../utils/addVirtualsToSchema";
import { ModelsNamesEnum } from "../../types/enum/ModelsNamesEnum";

interface TrackDocInterface extends Document {
  artist_name: string;
  track_name: string;
  track_id: string;
  genre: string;
  popularity?: number;
  year?: number;
  danceability?: number;
  energy?: number;
  key?: number;
  loudness?: number;
  mode?: number;
  speechiness?: number;
  acousticness?: number;
  instrumentalness?: number;
  liveness?: number;
  valence?: number;
  tempo?: number;
  duration_ms?: number;
  time_sgnature?: number;
  trackCover?: string;
  deezerId?: number | null;
  artists?: { name: string }[];
}

interface TrackModelInterface extends Model<TrackDocInterface> {}

const TrackSchema: Schema = new Schema(
  {
    artist_name: {
      type: String,
      required: true,
    },
    track_name: {
      type: String,
      required: true,
    },
    track_id: {
      type: String,
      required: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    danceability: {
      type: Number,
      default: 0,
    },
    energy: {
      type: Number,
      default: 0,
    },
    key: {
      type: Number,
      default: 0,
    },
    loudness: {
      type: Number,
      default: 0,
    },
    mode: {
      type: Number,
      default: 0,
    },
    speechiness: {
      type: Number,
      default: 0,
    },
    acousticness: {
      type: Number,
      default: 0,
    },
    instrumentalness: {
      type: Number,
      default: 0,
    },
    liveness: {
      type: Number,
      default: 0,
    },
    valence: {
      type: Number,
      default: 0,
    },
    tempo: {
      type: Number,
      default: 0,
    },
    duration_ms: {
      type: Number,
      default: 0,
    },
    trackCover: {
      type: String,
      required: false,
    },
    // Stable Deezer id; preview URLs are fetched fresh at play time because
    // Deezer signs them with a short expiry.
    deezerId: {
      type: Number,
      required: false,
    },
    artists: {
      type: [{ name: String }],
      required: false,
    },
  },
  { timestamps: true }
);

addVirtualsToSchema(TrackSchema);

export const TrackModel = model<TrackDocInterface, TrackModelInterface>(
  ModelsNamesEnum.TRACK,
  TrackSchema
);
