import test from "node:test";
import assert from "node:assert/strict";
import {
  formatJobSalary,
  formatJobDate,
  jobLabel,
} from "../lib/job-display.ts";

test("salary distinguishes minimum, maximum, range and exact amount", () => {
  assert.equal(formatJobSalary(50000, undefined, "USD"), "From $50,000");
  assert.equal(formatJobSalary(undefined, 80000, "USD"), "Up to $80,000");
  assert.equal(formatJobSalary(50000, 80000, "USD"), "$50,000 – $80,000");
  assert.equal(formatJobSalary(50000, 50000, "USD"), "$50,000");
});

test("salary handles absent and nonfinite values without inventing compensation", () => {
  assert.equal(formatJobSalary(), "Not disclosed");
  assert.equal(formatJobSalary(NaN, Infinity), "Not disclosed");
  assert.equal(formatJobSalary(0), "From $0");
  assert.doesNotThrow(() => formatJobSalary(100, 500, "invalid currency"));
});

test("dates are stable across time zones and ignore malformed data", () => {
  assert.equal(formatJobDate("2026-09-10T10:00:00Z"), "Sep 10, 2026");
  assert.equal(formatJobDate("2026-09-10T01:00:00+05:00"), "Sep 9, 2026");
  assert.equal(formatJobDate("bad date"), null);
  assert.equal(formatJobDate(), null);
});

test("job metadata uses readable labels and handles absent fields", () => {
  assert.equal(jobLabel("FULL_TIME"), "Full-time");
  assert.equal(jobLabel("BEGINNER"), "Entry level");
  assert.equal(jobLabel("ON_SITE"), "On-site");
  assert.equal(jobLabel("REMOTE"), "Remote");
  assert.equal(jobLabel(), "Not specified");
});
