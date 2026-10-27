import { AdImpressionModel } from "../models/adImpression.model";

export class AdImpressionRecord {
  async logImpression(
    userId: string,
    campaignId: string,
    brand: string,
    genre: string,
    estimatedRevenue: number,
    variant: string
  ): Promise<any> {
    const impression = await AdImpressionModel.create({
      user: userId,
      campaignId,
      brand,
      genre,
      estimatedRevenue,
      variant,
    });

    return impression;
  }

  async getStatsByGenre(): Promise<any> {
    const stats = await AdImpressionModel.aggregate([
      {
        $group: {
          _id: "$genre",
          impressions: { $sum: 1 },
          revenue: { $sum: "$estimatedRevenue" },
        },
      },
      { $sort: { impressions: -1 } },
    ]);

    return stats.map((row) => ({
      genre: row._id,
      impressions: row.impressions,
      revenue: Math.round(row.revenue * 10000) / 10000,
    }));
  }
}

export const adImpressionRecord = new AdImpressionRecord();
