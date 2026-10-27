import { model, Schema, Model, Document } from "mongoose";
import { ModelsNamesEnum } from "../../types/enum/ModelsNamesEnum";

interface AdImpressionDocInterface extends Document {
  user: string;
  campaignId: string;
  brand: string;
  genre: string;
  estimatedRevenue: number;
  variant?: string;
  createdAt: Date;
}

interface AdImpressionModelInterface
  extends Model<AdImpressionDocInterface> {}

const AdImpressionSchema: Schema = new Schema(
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

    estimatedRevenue: {
      type: Number,
      required: true,
    },

    // A/B test group; absent on impressions logged before the experiment.
    variant: {
      type: String,
      required: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdImpressionModel = model<
  AdImpressionDocInterface,
  AdImpressionModelInterface
>(ModelsNamesEnum.AD_IMPRESSION, AdImpressionSchema);
