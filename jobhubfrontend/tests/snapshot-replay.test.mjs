import test from "node:test";
import assert from "node:assert/strict";
import {
  limitedEvidenceValue,
  limitedSnapshotNotes,
  snapshotReplayEvents,
} from "../lib/snapshot-replay.ts";

const snapshot = {
  platform: "GITHUB",
  aiCoolFeedItems: Array.from(
    { length: 14 },
    (_, index) => `Processing repo: project-${index + 1}`,
  ),
  summary: {
    repoCount: 14,
    topRepositories: ["one", "two", "three", "four", "five"],
  },
};

test("snapshot replay displays at most ten processing events", () => {
  const result = limitedSnapshotNotes(snapshot);

  assert.equal(result.notes.length, 10);
  assert.equal(result.hiddenCount, 4);
  assert.equal(
    snapshotReplayEvents([snapshot]).filter((event) => event.kind === "note")
      .length,
    10,
  );
});

test("snapshot summaries keep only three highlights at every array level", () => {
  assert.deepEqual(
    limitedEvidenceValue({
      projects: ["one", "two", "three", "four", "five"],
      nested: { tags: ["a", "b", "c", "d", "e"] },
    }),
    {
      projects: ["one", "two", "three"],
      nested: { tags: ["a", "b", "c"] },
    },
  );
});
