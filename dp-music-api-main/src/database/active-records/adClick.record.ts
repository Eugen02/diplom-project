import { AdClickModel } from "../models/adClick.model";

export class AdClickRecord {
  async logClick(
    userId: string,
    campaignId: string,
    brand: string,
    genre: string,
    variant: string
  ): Promise<any> {
    const click = await AdClickModel.create({
      user: userId,
      campaignId,
      brand,
      genre,
      variant,
    });

    return click;
  }

  async getClicksByGenre(): Promise<Record<string, number>> {
    const stats = await AdClickModel.aggregate([
      {
        $group: {
          _id: "$genre",
          clicks: { $sum: 1 },
        },
      },
    ]);

    return stats.reduce((acc: Record<string, number>, row) => {
      acc[row._id] = row.clicks;

      return acc;
    }, {});
  }
}

export const adClickRecord = new AdClickRecord();
