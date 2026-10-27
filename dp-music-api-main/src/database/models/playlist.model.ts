import { model, Schema, Model, Document } from "mongoose";
import { addVirtualsToSchema } from "../../utils/addVirtualsToSchema";
import { ModelsNamesEnum } from "../../types/enum/ModelsNamesEnum";
import { PlaylistTypeEnum } from "../../types/enum/PlaylistTypes.enum";

interface PlaylistDocInterface extends Document {
  name: string;
  tracks: string[];
  owner: string;
  type: PlaylistTypeEnum;
  genres?: string[];
}

interface PlaylistModelInterface extends Model<PlaylistDocInterface> {}

const PlaylistSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelsNamesEnum.TRACK,
        default: [],
      },
    ],

    type: {
      type: String,
      enum: Object.values(PlaylistTypeEnum),
      default: PlaylistTypeEnum.PLAYLIST,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: ModelsNamesEnum.USER,
      required: true,
    },

    genres: {
      type: [String],
      required: false,
    },
  },
  { timestamps: true }
);

addVirtualsToSchema(PlaylistSchema);

export const PlaylistModel = model<
  PlaylistDocInterface,
  PlaylistModelInterface
>(ModelsNamesEnum.PLAYLIST, PlaylistSchema);
