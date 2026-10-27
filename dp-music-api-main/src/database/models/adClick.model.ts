import { model, Schema, Model, Document } from "mongoose";
import { ModelsNamesEnum } from "../../types/enum/ModelsNamesEnum";

interface AdClickDocInterface extends Document {
  user: string;
  campaignId: string;
  brand: string;
  genre: string;
  variant?: string;
  createdAt: Date;
}

interface AdClickModelInterface extends Model<AdClickDocInterface> {}

const AdClickSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: ModelsNamesEnum.USER,
      required: true,
    },

    campaignId: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    genre: {
      type: String,
      required: true,
    },

    variant: {
      type: String,
      required: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdClickModel = model<AdClickDocInterface, AdClickModelInterface>(
  ModelsNamesEnum.AD_CLICK,
  AdClickSchema
);
