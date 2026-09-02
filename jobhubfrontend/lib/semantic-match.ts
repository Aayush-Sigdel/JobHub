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
}> = [
  { key: "platformSimilarity", label: "JobHub profile" },
  { key: "githubSimilarity", label: "GitHub" },
  { key: "stackoverflowSimilarity", label: "Stack Overflow" },
  { key: "devtoSimilarity", label: "Dev.to" },
  { key: "orcidSimilarity", label: "ORCID" },
  { key: "portfolioSimilarity", label: "Portfolio" },
];

export function clampSimilarity(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function semanticMatchPercentage(value?: number | null): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(clampSimilarity(value) * 100);
}

export function getSimilaritySources(evidence: SimilarityEvidence): SimilaritySource[] {
  return similaritySources.flatMap(({ key, label }) => {
    const value = evidence[key];
    return typeof value === "number" && Number.isFinite(value)
      ? [{ key, label, value: clampSimilarity(value) }]
      : [];
  });
}
