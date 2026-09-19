import test from "node:test";
import assert from "node:assert/strict";
import { evaluationRequiresOverride } from "../lib/task/assessment-submission.ts";

const passingResult = {
  taskId: "task-1",
  taskType: "PROGRAMMING",
  passed: true,
  achievedScore: 5,
  requiredScore: 5,
};

test("passing evaluations can use the normal submit action", () => {
  assert.equal(evaluationRequiresOverride(passingResult), false);
});

test("failed, low-score, and errored evaluations require send-anyway confirmation", () => {
  assert.equal(
    evaluationRequiresOverride({
      ...passingResult,
      passed: false,
      achievedScore: 3,
    }),
    true,
  );
  assert.equal(
    evaluationRequiresOverride({
      ...passingResult,
      achievedScore: 4,
    }),
    true,
  );
  assert.equal(
    evaluationRequiresOverride({
      ...passingResult,
      passed: false,
      achievedScore: 0,
      message: "Compilation failed",
    }),
    true,
  );
  assert.equal(
    evaluationRequiresOverride(undefined, "Service unavailable"),
    true,
  );
});
