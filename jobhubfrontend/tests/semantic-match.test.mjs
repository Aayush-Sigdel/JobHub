import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSupportedOverallSimilarity,
  getSimilarityContributions,
} from "../lib/semantic-match.ts";

test("source contributions reproduce the displayed overall match", () => {
  const evidence = { platformSimilarity: 0.86, githubSimilarity: 0.78, devtoSimilarity: 0.64 };
  const contributions = getSimilarityContributions(evidence);
  const points = contributions.reduce((sum, source) => sum + source.points, 0);
  assert.equal(Math.round(points * 10) / 1000, calculateSupportedOverallSimilarity(evidence));
  assert.ok(Math.abs(contributions.reduce((sum, source) => sum + source.normalizedWeight, 0) - 1) < 1e-12);
});

test("a single available source gets the entire weighting", () => {
  const [source] = getSimilarityContributions({ githubSimilarity: 0.78 });
  assert.equal(source.normalizedWeight, 1);
  assert.equal(source.points, 78);
});

test("zero scores remain included while missing and nonfinite scores are excluded", () => {
  const sources = getSimilarityContributions({ platformSimilarity: 0, githubSimilarity: 1, devtoSimilarity: NaN, orcidSimilarity: Infinity });
  assert.equal(sources.length, 2);
  assert.equal(sources[0].points, 0);
  assert.equal(sources[0].normalizedWeight, 0.625);
  assert.equal(sources[1].points, 37.5);
});

test("portfolio is not assigned a contribution to the weighted score", () => {
  assert.deepEqual(getSimilarityContributions({ portfolioSimilarity: 0.92 }), []);
  assert.deepEqual(getSimilarityContributions({}), []);
});

test("out-of-range values use the same clamping as the overall score", () => {
  const evidence = { platformSimilarity: -1, githubSimilarity: 2 };
  const sources = getSimilarityContributions(evidence);
  assert.deepEqual(sources.map(({ value }) => value), [0, 1]);
  assert.equal(sources.reduce((sum, source) => sum + source.points, 0), calculateSupportedOverallSimilarity(evidence) * 100);
});
