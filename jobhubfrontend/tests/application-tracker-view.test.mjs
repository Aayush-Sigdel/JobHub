import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveTrackerTab,
  matchesTrackedRole,
  matchesApplicationStage,
  compareTrackedDates,
} from "../lib/application-tracker-view.ts";

test("tracker defaults to all applications, including unknown deep links", () => {
  for (const value of [null, "applications", "invalid", ""]) {
    assert.deepEqual(resolveTrackerTab(value), {
      tab: "applications",
      stage: "all",
    });
  }
});

test("existing stage, saved and draft links still select the right view", () => {
  for (const stage of [
    "applied",
    "in-review",
    "shortlisted",
    "accepted",
    "rejected",
  ]) {
    assert.deepEqual(resolveTrackerTab(stage), { tab: "applications", stage });
  }
  for (const tab of ["saved", "in-progress"]) {
    assert.deepEqual(resolveTrackerTab(tab), { tab, stage: "all" });
  }
});

test("all stages includes every status and an individual stage filters correctly", () => {
  for (const status of [
    "APPLIED",
    "IN_REVIEW",
    "SHORTLISTED",
    "ACCEPTED",
    "REJECTED",
  ]) {
    assert.equal(matchesApplicationStage(status, "all"), true);
  }
  assert.equal(matchesApplicationStage("IN_REVIEW", "in-review"), true);
  assert.equal(matchesApplicationStage("APPLIED", "in-review"), false);
});

test("search trims whitespace and matches either a role or company", () => {
  assert.equal(
    matchesTrackedRole("Frontend developer", "JobHub", " FRONTEND "),
    true,
  );
  assert.equal(
    matchesTrackedRole("Frontend developer", "JobHub", "jobhub"),
    true,
  );
  assert.equal(
    matchesTrackedRole("Frontend developer", "JobHub", "designer"),
    false,
  );
  assert.equal(matchesTrackedRole("Frontend developer", "JobHub", "  "), true);
});

test("date order can be reversed and malformed dates do not break sorting", () => {
  const early = "2026-09-01";
  const late = "2026-09-10";
  assert.ok(compareTrackedDates(early, late) > 0);
  assert.ok(compareTrackedDates(early, late, true) < 0);
  assert.ok(Number.isFinite(compareTrackedDates("invalid", late)));
});
