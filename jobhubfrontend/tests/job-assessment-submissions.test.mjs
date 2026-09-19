import test from "node:test";
import assert from "node:assert/strict";
import {
  hasCompletedRequiredAssessments,
  saveJobAssessmentSubmission,
} from "../lib/job-assessment-submissions.ts";

function withLocalStorage(run) {
  const values = new Map();
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    dispatchEvent: () => true,
  };
  try {
    run();
  } finally {
    globalThis.window = previousWindow;
  }
}

test("required assessments can complete without submitting the application", () => {
  withLocalStorage(() => {
    const required = ["PROGRAMMING", "SQL"];
    const result = {
      id: "submission-1",
      taskId: "task-1",
      taskType: "PROGRAMMING",
      passed: true,
      achievedScore: 5,
      requiredScore: 5,
    };

    saveJobAssessmentSubmission("job-1", result);
    assert.equal(hasCompletedRequiredAssessments("job-1", required), false);

    saveJobAssessmentSubmission("job-1", {
      ...result,
      id: "submission-2",
      taskId: "task-2",
      taskType: "SQL",
    });
    assert.equal(hasCompletedRequiredAssessments("job-1", required), true);
  });
});
