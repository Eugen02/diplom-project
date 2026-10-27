// Normalized Shannon entropy of a count distribution, 0..1.
// H = -Σ pᵢ·ln(pᵢ), normalized by ln(k) so 1 means perfectly even across k categories.
export const normalizedEntropy = (counts: number[]): number => {
  const positive = counts.filter((count) => count > 0);
  const total = positive.reduce((sum, count) => sum + count, 0);

  if (positive.length < 2 || !total) {
    return 0;
  }

  const entropy = positive.reduce((sum, count) => {
    const p = count / total;

    return sum - p * Math.log(p);
  }, 0);

  return entropy / Math.log(positive.length);
};

// Cosine similarity of two non-negative vectors, 0..1. Scale-invariant, so raw
// counts and shares give the same result.
export const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  a.forEach((value, index) => {
    dot += value * b[index];
    normA += value * value;
    normB += b[index] * b[index];
  });

  if (!normA || !normB) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Effective cost per mille: revenue per 1000 impressions.
export const ecpm = (revenue: number, impressions: number): number =>
  impressions ? (revenue / impressions) * 1000 : 0;
