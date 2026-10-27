import { createHash } from "crypto";

// Parameters of the simulated ad monetization model. Exposed via /user/stats so
// the statistics page documents the exact values in use.
export const AD_IMPRESSION_CHANCE = 0.45;
export const AD_MIN_REVENUE = 0.002;
export const AD_MAX_REVENUE = 0.02;

// A/B test: group A gets genre-targeted campaigns, group B a campaign drawn
// from the full pool regardless of genre.
export enum AdVariantEnum {
  TARGETED = "targeted",
  RANDOM = "random",
}

// Deterministic 50/50 split, so a user stays in the same group across sessions.
export const getAdVariant = (userId: string): AdVariantEnum => {
  const firstByte = createHash("md5").update(String(userId)).digest()[0];

  return firstByte % 2 === 0 ? AdVariantEnum.TARGETED : AdVariantEnum.RANDOM;
};
