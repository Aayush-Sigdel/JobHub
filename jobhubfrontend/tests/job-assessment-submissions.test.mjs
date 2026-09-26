import test from "node:test";
import assert from "node:assert/strict";
import {
  hasCompletedRequiredAssessments,
  saveJobAssessmentSubmission,
  loadJobAssessmentSubmission,
  saveJobApplicationDraft,
  buildVerifiedApplicationRequest,
} from "../lib/job-assessment-submissions.ts";

import {
  clearLocalSessionData,
  synchronizeLocalSession,
  STORAGE_OWNER_KEY,
} from "../lib/local-session-storage.ts";

function withLocalStorage(run) {
  const values = new Map();
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      get length() {
        return values.size;
      },
      key: (index) => [...values.keys()][index] ?? null,
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    sessionStorage: { getItem: () => null, setItem: () => {}, clear: () => {} },
    dispatchEvent: () => true,
  };
  try {
    synchronizeLocalSession("user-a");
    run(values);
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

    saveJobAssessmentSubmission("user-a", "job-1", result);
    assert.equal(
      hasCompletedRequiredAssessments("user-a", "job-1", required),
      false,
    );

    saveJobAssessmentSubmission("user-a", "job-1", {
      ...result,
      id: "submission-2",
      taskId: "task-2",
      taskType: "SQL",
    });
    assert.equal(
      hasCompletedRequiredAssessments("user-a", "job-1", required),
      true,
    );
  });
});

const submission = {
  id: "submission-a",
  taskId: "task-1",
  taskType: "PROGRAMMING",
  passed: true,
  achievedScore: 5,
  requiredScore: 5,
};

test("one user's completion never completes another user's task", () => {
  withLocalStorage(() => {
    saveJobAssessmentSubmission("user-a", "job-1", submission);
    saveJobApplicationDraft("user-a", "job-1", "Private cover note");
    assert.equal(
      loadJobAssessmentSubmission("user-b", "job-1", "PROGRAMMING"),
      undefined,
    );
    assert.equal(
      hasCompletedRequiredAssessments("user-b", "job-1", ["PROGRAMMING"]),
      false,
    );
    assert.equal(
      buildVerifiedApplicationRequest("user-b", "job-1", ["PROGRAMMING"]),
      undefined,
    );
    assert.equal(
      buildVerifiedApplicationRequest("user-a", "job-1", ["PROGRAMMING"])
        .programmingSubmissionId,
      submission.id,
    );
  });
});

test("same-account reload preserves recorded submissions and cover notes", () => {
  withLocalStorage(() => {
    saveJobAssessmentSubmission("user-a", "job-1", submission);
    saveJobApplicationDraft("user-a", "job-1", "My note");
    synchronizeLocalSession("user-a");
    assert.equal(
      loadJobAssessmentSubmission("user-a", "job-1", "PROGRAMMING", "task-1")
        .id,
      submission.id,
    );
    assert.equal(
      buildVerifiedApplicationRequest("user-a", "job-1", ["PROGRAMMING"])
        .coverNote,
      "My note",
    );
  });
});

test("logout then login clears task progress and drafts but preserves exact bookmarks", () => {
  withLocalStorage((values) => {
    const bookmarks = '[{"jobId":"job-1","jobTitle":"Developer"}]';
    values.set("jobhub_saved_jobs", bookmarks);
    saveJobAssessmentSubmission("user-a", "job-1", submission);
    saveJobApplicationDraft("user-a", "job-1", "My note");
    clearLocalSessionData();
    assert.deepEqual([...values.entries()], [["jobhub_saved_jobs", bookmarks]]);
    synchronizeLocalSession("user-b");
    assert.equal(
      hasCompletedRequiredAssessments("user-b", "job-1", ["PROGRAMMING"]),
      false,
    );
    assert.equal(
      buildVerifiedApplicationRequest("user-b", "job-1", ["PROGRAMMING"]),
      undefined,
    );
    assert.equal(values.get("jobhub_saved_jobs"), bookmarks);
  });
});

test("account switches reject late writes from the previous user's task", () => {
  withLocalStorage((values) => {
    synchronizeLocalSession("user-b");
    saveJobAssessmentSubmission("user-a", "job-1", submission);
    saveJobApplicationDraft("user-a", "job-1", "Late response");
    assert.deepEqual([...values.keys()], [STORAGE_OWNER_KEY]);
    assert.equal(
      loadJobAssessmentSubmission("user-b", "job-1", "PROGRAMMING"),
      undefined,
    );
  });
});

test("legacy, unauthenticated, mismatched, and malformed submissions are ignored", () => {
  withLocalStorage((values) => {
    values.set("job_submission_job-1_PROGRAMMING", JSON.stringify(submission));
    assert.equal(
      loadJobAssessmentSubmission("user-a", "job-1", "PROGRAMMING"),
      undefined,
    );
    assert.equal(
      loadJobAssessmentSubmission(undefined, "job-1", "PROGRAMMING"),
      undefined,
    );
    saveJobAssessmentSubmission(undefined, "job-1", submission);
    saveJobAssessmentSubmission("user-a", "job-1", submission);
    assert.equal(
      loadJobAssessmentSubmission(
        "user-a",
        "job-1",
        "PROGRAMMING",
        "replacement-task",
      ),
      undefined,
    );
    const key = [...values.keys()].find((key) =>
      key.startsWith("jobhub:user:"),
    );
    values.set(key, "invalid JSON");
    assert.equal(
      loadJobAssessmentSubmission("user-a", "job-1", "PROGRAMMING"),
      undefined,
    );
    values.set(key, JSON.stringify({ ...submission, taskType: "SQL" }));
    assert.equal(
      loadJobAssessmentSubmission("user-a", "job-1", "PROGRAMMING"),
      undefined,
    );
  });
});
