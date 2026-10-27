import { Types } from "mongoose";
import { PlayHistoryModel } from "../models/playHistory.model";
import { AdImpressionModel } from "../models/adImpression.model";
import { AdClickModel } from "../models/adClick.model";
import { PlaylistModel } from "../models/playlist.model";
import {
  AD_IMPRESSION_CHANCE,
  AD_MAX_REVENUE,
  AD_MIN_REVENUE,
  AdVariantEnum,
  getAdVariant,
} from "../../constants/adModel";

const Z_95 = 1.959964;
const Z_POWER_80 = 0.841621;
const SIGNIFICANCE_LEVEL = 0.05;
// Smallest relative CTR difference the experiment is sized to detect.
const MINIMUM_DETECTABLE_LIFT = 0.5;
const FALLBACK_BASELINE_CTR = 0.02;

// Standard normal CDF via the Abramowitz–Stegun 7.1.26 erf approximation
// (absolute error < 1.5e-7).
const normalCdf = (x: number): number => {
  const t = 1 / (1 + (0.3275911 * Math.abs(x)) / Math.SQRT2);
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(x * x) / 2);

  return x >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
};

const wilsonInterval = (clicks: number, n: number): [number, number] => {
  if (!n) {
    return [0, 0];
  }

  const p = clicks / n;
  const z2 = Z_95 * Z_95;
  const denominator = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denominator;
  const half =
    (Z_95 * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denominator;

  return [Math.max(0, center - half), Math.min(1, center + half)];
};

const requiredSamplePerGroup = (baseline: number, lift: number): number => {
  const p1 = baseline;
  const p2 = Math.min(baseline * (1 + lift), 0.999);
  const variance = p1 * (1 - p1) + p2 * (1 - p2);

  return Math.ceil(((Z_95 + Z_POWER_80) ** 2 * variance) / (p2 - p1) ** 2);
};

const ACTIVITY_DAYS = 14;
const TOP_TRACKS_LIMIT = 5;

const roundMoney = (value: number) => Math.round(value * 10000) / 10000;

const ctrPercent = (clicks: number, impressions: number) =>
  impressions ? Math.round((clicks / impressions) * 10000) / 100 : 0;

const toDayKey = (date: Date) => date.toISOString().slice(0, 10);

export class StatsRecord {
  async getUserStats(userId: string): Promise<any> {
    const user = new Types.ObjectId(userId);

    const activitySince = new Date();
    activitySince.setUTCHours(0, 0, 0, 0);
    activitySince.setUTCDate(activitySince.getUTCDate() - (ACTIVITY_DAYS - 1));

    const [
      totalPlays,
      uniqueTrackIds,
      playsByGenre,
      playsByDayRaw,
      topTracksRaw,
      playlistGenres,
      playlistsCount,
      adsByBrandRaw,
      adsByGenreRaw,
      clicksByBrandRaw,
      clicksByGenreRaw,
    ] = await Promise.all([
      PlayHistoryModel.countDocuments({ user }),
      PlayHistoryModel.distinct("track", { user }),
      PlayHistoryModel.aggregate([
        { $match: { user } },
        { $group: { _id: "$genre", plays: { $sum: 1 } } },
        { $sort: { plays: -1 } },
      ]),
      PlayHistoryModel.aggregate([
        { $match: { user, createdAt: { $gte: activitySince } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            plays: { $sum: 1 },
          },
        },
      ]),
      PlayHistoryModel.aggregate([
        { $match: { user } },
        { $group: { _id: "$track", plays: { $sum: 1 } } },
        { $sort: { plays: -1 } },
        { $limit: TOP_TRACKS_LIMIT },
        {
          $lookup: {
            from: "tracks",
            localField: "_id",
            foreignField: "_id",
            as: "track",
          },
        },
        { $unwind: "$track" },
      ]),
      PlaylistModel.aggregate([
        { $match: { owner: user } },
        { $unwind: "$tracks" },
        {
          $lookup: {
            from: "tracks",
            localField: "tracks",
            foreignField: "_id",
            as: "track",
          },
        },
        { $unwind: "$track" },
        { $group: { _id: "$track.genre", tracks: { $sum: 1 } } },
        { $sort: { tracks: -1 } },
      ]),
      PlaylistModel.countDocuments({ owner: user }),
      AdImpressionModel.aggregate([
        { $match: { user } },
        { $group: { _id: "$brand", impressions: { $sum: 1 } } },
        { $sort: { impressions: -1 } },
      ]),
      AdImpressionModel.aggregate([
        { $match: { user } },
        {
          $group: {
            _id: "$genre",
            impressions: { $sum: 1 },
            revenue: { $sum: "$estimatedRevenue" },
          },
        },
        { $sort: { impressions: -1 } },
      ]),
      AdClickModel.aggregate([
        { $match: { user } },
        { $group: { _id: "$brand", clicks: { $sum: 1 } } },
      ]),
      AdClickModel.aggregate([
        { $match: { user } },
        { $group: { _id: "$genre", clicks: { $sum: 1 } } },
      ]),
    ]);

    const clicksByBrand = new Map<string, number>(
      clicksByBrandRaw.map((row: any) => [row._id, row.clicks])
    );
    const clicksByGenre = new Map<string, number>(
      clicksByGenreRaw.map((row: any) => [row._id, row.clicks])
    );

    const playsByDayMap = new Map<string, number>(
      playsByDayRaw.map((row: any) => [row._id, row.plays])
    );
    const playsByDay = Array.from({ length: ACTIVITY_DAYS }, (_, offset) => {
      const day = new Date(activitySince);
      day.setUTCDate(activitySince.getUTCDate() + offset);
      const key = toDayKey(day);

      return { date: key, plays: playsByDayMap.get(key) || 0 };
    });

    const adsByGenre = adsByGenreRaw.map((row: any) => {
      const clicks = clicksByGenre.get(row._id) || 0;

      return {
        genre: row._id,
        impressions: row.impressions,
        clicks,
        ctr: ctrPercent(clicks, row.impressions),
        revenue: roundMoney(row.revenue),
      };
    });

    const adImpressions = adsByGenre.reduce(
      (sum: number, row: any) => sum + row.impressions,
      0
    );
    const adClicks = clicksByGenreRaw.reduce(
      (sum: number, row: any) => sum + row.clicks,
      0
    );
    const estimatedRevenue = roundMoney(
      adsByGenre.reduce((sum: number, row: any) => sum + row.revenue, 0)
    );

    return {
      summary: {
        totalPlays,
        uniqueTracks: uniqueTrackIds.length,
        topGenre: playsByGenre[0]?._id || null,
        playlistsCount,
        playlistTracksCount: playlistGenres.reduce(
          (sum: number, row: any) => sum + row.tracks,
          0
        ),
        adImpressions,
        adClicks,
        ctr: ctrPercent(adClicks, adImpressions),
        estimatedRevenue,
      },
      playsByDay,
      playsByGenre: playsByGenre.map((row: any) => ({
        genre: row._id,
        plays: row.plays,
      })),
      playlistGenres: playlistGenres.map((row: any) => ({
        genre: row._id,
        tracks: row.tracks,
      })),
      topTracks: topTracksRaw.map((row: any) => ({
        id: row._id,
        trackName: row.track.track_name,
        artistName: row.track.artist_name,
        genre: row.track.genre,
        trackCover: row.track.trackCover,
        artists: row.track.artists || [],
        durationMs: row.track.duration_ms,
        plays: row.plays,
      })),
      adsByBrand: adsByBrandRaw.map((row: any) => ({
        brand: row._id,
        impressions: row.impressions,
        clicks: clicksByBrand.get(row._id) || 0,
      })),
      adsByGenre,
    };
  }

  async getAdExperiment(userId: string): Promise<any> {
    const [impressionsByVariant, clicksByVariant] = await Promise.all([
      AdImpressionModel.aggregate([
        { $match: { variant: { $exists: true } } },
        {
          $group: {
            _id: "$variant",
            impressions: { $sum: 1 },
            revenue: { $sum: "$estimatedRevenue" },
            users: { $addToSet: "$user" },
            since: { $min: "$createdAt" },
          },
        },
      ]),
      AdClickModel.aggregate([
        { $match: { variant: { $exists: true } } },
        { $group: { _id: "$variant", clicks: { $sum: 1 } } },
      ]),
    ]);

    const groups = [AdVariantEnum.TARGETED, AdVariantEnum.RANDOM].map((variant) => {
      const impressionRow = impressionsByVariant.find((row: any) => row._id === variant);
      const clicks =
        clicksByVariant.find((row: any) => row._id === variant)?.clicks || 0;
      const impressions = impressionRow?.impressions || 0;
      const revenue = impressionRow?.revenue || 0;
      const [ciLow, ciHigh] = wilsonInterval(clicks, impressions);

      return {
        variant,
        users: impressionRow?.users.length || 0,
        impressions,
        clicks,
        ctr: impressions ? clicks / impressions : 0,
        ciLow,
        ciHigh,
        revenue: roundMoney(revenue),
        since: impressionRow?.since || null,
      };
    });

    const [targeted, random] = groups;
    const pooledImpressions = targeted.impressions + random.impressions;
    const pooledCtr = pooledImpressions
      ? (targeted.clicks + random.clicks) / pooledImpressions
      : 0;
    const standardError = Math.sqrt(
      pooledCtr *
        (1 - pooledCtr) *
        (targeted.impressions && random.impressions
          ? 1 / targeted.impressions + 1 / random.impressions
          : 0)
    );

    const zScore = standardError ? (targeted.ctr - random.ctr) / standardError : null;
    const pValue = zScore === null ? null : 2 * (1 - normalCdf(Math.abs(zScore)));
    const lift = random.ctr ? (targeted.ctr - random.ctr) / random.ctr : null;

    const baselineCtr = pooledCtr || FALLBACK_BASELINE_CTR;
    const requiredPerGroup = requiredSamplePerGroup(
      baselineCtr,
      MINIMUM_DETECTABLE_LIFT
    );
    const hasEnoughData =
      Math.min(targeted.impressions, random.impressions) >= requiredPerGroup;

    let verdict = "insufficient_data";
    if (hasEnoughData && pValue !== null) {
      verdict = pValue < SIGNIFICANCE_LEVEL ? "significant" : "not_significant";
    }

    const since = groups
      .map((group) => group.since)
      .filter(Boolean)
      .sort((a: Date, b: Date) => new Date(a).getTime() - new Date(b).getTime())[0];

    return {
      yourGroup: getAdVariant(userId),
      since: since || null,
      groups,
      pooledCtr,
      zScore,
      pValue,
      lift,
      alpha: SIGNIFICANCE_LEVEL,
      power: 0.8,
      minimumDetectableLift: MINIMUM_DETECTABLE_LIFT,
      baselineCtr,
      requiredPerGroup,
      verdict,
    };
  }

  // Track ids (Spotify) of every playlist on the platform, for offline
  // evaluation of the recommender.
  async getAllPlaylistTrackIds(): Promise<string[][]> {
    const playlists = await PlaylistModel.aggregate([
      { $match: { "tracks.2": { $exists: true } } },
      {
        $lookup: {
          from: "tracks",
          localField: "tracks",
          foreignField: "_id",
          as: "trackDocs",
        },
      },
      { $project: { trackIds: "$trackDocs.track_id" } },
    ]);

    return playlists.map((playlist: any) => playlist.trackIds);
  }

  async getPlatformAdStats(): Promise<any> {
    const [impressionsByGenre, clicksByGenreRaw] = await Promise.all([
      AdImpressionModel.aggregate([
        {
          $group: {
            _id: "$genre",
            impressions: { $sum: 1 },
            revenue: { $sum: "$estimatedRevenue" },
          },
        },
        { $sort: { impressions: -1 } },
      ]),
      AdClickModel.aggregate([{ $group: { _id: "$genre", clicks: { $sum: 1 } } }]),
    ]);

    const clicksByGenre = new Map<string, number>(
      clicksByGenreRaw.map((row: any) => [row._id, row.clicks])
    );

    const byGenre = impressionsByGenre.map((row: any) => {
      const clicks = clicksByGenre.get(row._id) || 0;

      return {
        genre: row._id,
        impressions: row.impressions,
        clicks,
        ctr: ctrPercent(clicks, row.impressions),
        revenue: roundMoney(row.revenue),
      };
    });

    const impressions = byGenre.reduce((sum: number, row: any) => sum + row.impressions, 0);
    const clicks = clicksByGenreRaw.reduce((sum: number, row: any) => sum + row.clicks, 0);

    return {
      model: {
        adChance: AD_IMPRESSION_CHANCE,
        minRevenue: AD_MIN_REVENUE,
        maxRevenue: AD_MAX_REVENUE,
      },
      impressions,
      clicks,
      ctr: ctrPercent(clicks, impressions),
      revenue: roundMoney(byGenre.reduce((sum: number, row: any) => sum + row.revenue, 0)),
      byGenre,
    };
  }
}

export const statsRecord = new StatsRecord();
