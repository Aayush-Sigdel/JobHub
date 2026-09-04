export interface SimilarityEvidence {
  platformSimilarity?: number;
  githubSimilarity?: number;
  stackoverflowSimilarity?: number;
  devtoSimilarity?: number;
  orcidSimilarity?: number;
  portfolioSimilarity?: number;
}

export interface SimilaritySource {
  key: keyof SimilarityEvidence;
  label: string;
  value: number;
}

const similaritySources: Array<{
  key: keyof SimilarityEvidence;
  label: string;
  weight: number;
}> = [
  { key: "platformSimilarity", label: "JobHub platform", weight: 0.5 },
  { key: "githubSimilarity", label: "GitHub", weight: 0.3 },
  { key: "stackoverflowSimilarity", label: "Stack Overflow", weight: 0.1 },
  { key: "devtoSimilarity", label: "Dev.to", weight: 0.05 },
  { key: "orcidSimilarity", label: "ORCID", weight: 0.05 },
];

export function clampSimilarity(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getSimilaritySources(evidence: SimilarityEvidence): SimilaritySource[] {
  return similaritySources.flatMap(({ key, label }) => {
    const value = evidence[key];
    return typeof value === "number" && Number.isFinite(value)
      ? [{ key, label, value: clampSimilarity(value) }]
      : [];
  });
}

export function calculateSupportedOverallSimilarity(evidence: SimilarityEvidence): number | null {
  const availableSources = similaritySources.flatMap(({ key, weight }) => {
    const value = evidence[key];
    return typeof value === "number" && Number.isFinite(value)
      ? [{ value: clampSimilarity(value), weight }]
      : [];
  });

  const totalWeight = availableSources.reduce((total, source) => total + source.weight, 0);
  if (totalWeight === 0) return null;

  const weightedValue = availableSources.reduce(
    (total, source) => total + source.value * source.weight,
    0,
  );
  return Math.round((weightedValue / totalWeight) * 1000) / 1000;
}
