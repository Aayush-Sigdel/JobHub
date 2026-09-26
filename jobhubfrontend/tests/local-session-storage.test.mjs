import test from "node:test";
import assert from "node:assert/strict";
import {
  clearLocalSessionData,
  synchronizeLocalSession,
  STORAGE_OWNER_KEY,
} from "../lib/local-session-storage.ts";

function storage(entries = []) {
  const values = new Map(entries);
  return {
    get length() {
      return values.size;
    },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
}

function withWindow(run) {
  const previous = globalThis.window;
  globalThis.window = {
    localStorage: storage(),
    sessionStorage: storage(),
    dispatchEvent: () => {},
  };
  try {
    run(globalThis.window);
  } finally {
    globalThis.window = previous;
  }
}

test("first login purges legacy tasks, recruiter drafts, preferences, and monitoring; bookmarks survive", () => {
  withWindow(({ localStorage, sessionStorage }) => {
    const bookmarks = '[{"jobId":"saved-job"}]';
    localStorage.setItem("jobhub_saved_jobs", bookmarks);
    for (const key of [
      "",
      "job_submission_job-1_SQL",
      "job_application_draft_job-1",
      "jobhub_in_progress_jobs",
      "jobhub_job_post_draft_v1",
      "theme",
      "unknown-future-cache",
    ])
      localStorage.setItem(key, "old data");
    sessionStorage.setItem(
      "jobhub:assessment-monitor:v2:job-1:SQL:task-1",
      "12",
    );
    synchronizeLocalSession("user-b");
    assert.equal(localStorage.length, 2);
    assert.equal(localStorage.getItem("jobhub_saved_jobs"), bookmarks);
    assert.equal(localStorage.getItem(STORAGE_OWNER_KEY), "user:user-b");
    assert.equal(sessionStorage.length, 1);
  });
});

test("same-account reload retains temporary data but changing accounts clears it", () => {
  withWindow(({ localStorage, sessionStorage }) => {
    synchronizeLocalSession("user-a");
    localStorage.setItem("draft", "user-a draft");
    sessionStorage.setItem("monitor", "3");
    synchronizeLocalSession("user-a");
    assert.equal(localStorage.getItem("draft"), "user-a draft");
    assert.equal(sessionStorage.getItem("monitor"), "3");
    synchronizeLocalSession("user-b");
    assert.equal(localStorage.getItem("draft"), null);
    assert.equal(sessionStorage.getItem("monitor"), null);
  });
});

test("an expired session clears data even without clicking logout", () => {
  withWindow(({ localStorage, sessionStorage }) => {
    synchronizeLocalSession("user-a");
    localStorage.setItem("task", "completed");
    sessionStorage.setItem("monitor", "3");
    synchronizeLocalSession(null);
    assert.equal(localStorage.getItem("task"), null);
    assert.equal(sessionStorage.getItem("monitor"), null);
  });
});

test("blocked local storage does not prevent logout or clearing session storage", () => {
  withWindow((browser) => {
    browser.sessionStorage.setItem("monitor", "3");
    Object.defineProperty(browser, "localStorage", {
      get() {
        throw new Error("Storage disabled");
      },
    });
    assert.doesNotThrow(clearLocalSessionData);
    assert.equal(browser.sessionStorage.length, 0);
    assert.doesNotThrow(() => synchronizeLocalSession("user-a"));
  });
});
