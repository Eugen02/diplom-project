import { Request, Response } from "express";
import { adImpressionRecord } from "../database/active-records/adImpression.record";
import { adClickRecord } from "../database/active-records/adClick.record";
import { getAdCampaignById } from "../constants/adCampaigns";
import { getAdVariant } from "../constants/adModel";

export class AdsController {
  async getStats(request: Request, response: Response): Promise<void> {
    const impressionStats = await adImpressionRecord.getStatsByGenre();
    const clicksByGenre = await adClickRecord.getClicksByGenre();

    const stats = impressionStats.map((row: any) => {
      const clicks = clicksByGenre[row.genre] || 0;
      const ctr = row.impressions
        ? Math.round((clicks / row.impressions) * 10000) / 100
        : 0;

      return {
        ...row,
        clicks,
        ctr,
      };
    });

    response.status(200).json({ data: stats });
  }

  async logClick(request: Request, response: Response): Promise<void> {
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};
    const { campaignId } = request.body as { campaignId: string };

    if (!userId || !campaignId) {
      response.status(400).json({ error: "campaignId is required" });

      return;
    }

    const campaign = getAdCampaignById(campaignId);

    if (!campaign) {
      response.status(404).json({ error: "Campaign not found" });

      return;
    }

    const genre = request.body.genre || "unknown";

    await adClickRecord.logClick(
      userId,
      campaign.id,
      campaign.brand,
      genre,
      getAdVariant(userId)
    );

    response.status(200).json({ success: true });
  }
}
