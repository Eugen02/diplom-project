import { model, Schema, Model, Document } from "mongoose";
import { ModelsNamesEnum } from "../../types/enum/ModelsNamesEnum";

interface PlayHistoryDocInterface extends Document {
  user: string;
  track: string;
  genre: string;
  createdAt: Date;
}

interface PlayHistoryModelInterface extends Model<PlayHistoryDocInterface> {}

const PlayHistorySchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: ModelsNamesEnum.USER,
      required: true,
    },

    track: {
      type: Schema.Types.ObjectId,
      ref: ModelsNamesEnum.TRACK,
      required: true,
    },

    genre: {
      type: String,
      required: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PlayHistoryModel = model<
  PlayHistoryDocInterface,
  PlayHistoryModelInterface
>(ModelsNamesEnum.PLAY_HISTORY, PlayHistorySchema);
