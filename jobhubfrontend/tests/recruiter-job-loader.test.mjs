import test from "node:test";
import assert from "node:assert/strict";
import { loadRecruiterJob } from "../lib/recruiter-job-loader.ts";

const job = { id: "job-1", title: "Frontend developer", description: "Build accessible interfaces", designTaskId: "task-1", active: false };

test("uses recruiter details directly when available", async () => {
  const calls = [];
  const result = await loadRecruiterJob(job.id, async (path) => { calls.push(path); return job; });
  assert.equal(result, job);
  assert.deepEqual(calls, ["/recruiter/jobs/job-1"]);
});

for (const status of [404, 405, 500, 502, 503]) {
  test(`loads owned job details through the existing endpoint after ${status}`, async () => {
    const calls = [];
    const result = await loadRecruiterJob(job.id, async (path, options) => {
      calls.push(path);
      assert.equal(options.cache, "no-store");
      if (path === "/recruiter/jobs/job-1") throw Object.assign(new Error("Request failed"), { status });
      if (path === "/recruiter/jobs") return [{ id: job.id }];
      return { job, applicantCount: 4 };
    });
    assert.deepEqual(result, job);
    assert.deepEqual(calls, ["/recruiter/jobs/job-1", "/recruiter/jobs", "/jobs/job-1"]);
  });
}

for (const status of [401, 403]) {
  test(`does not fall back after an authorization error (${status})`, async () => {
    let calls = 0;
    await assert.rejects(loadRecruiterJob(job.id, async () => { calls++; throw Object.assign(new Error("Denied"), { status }); }), /Denied/);
    assert.equal(calls, 1);
  });
}

test("does not fetch public details for a job outside the recruiter’s listings", async () => {
  const calls = [];
  await assert.rejects(loadRecruiterJob(job.id, async (path) => {
    calls.push(path);
    if (path === "/recruiter/jobs/job-1") throw Object.assign(new Error("Missing"), { status: 404 });
    return [];
  }), /Missing/);
  assert.deepEqual(calls, ["/recruiter/jobs/job-1", "/recruiter/jobs"]);
});

test("rejects incomplete fallback payloads instead of rendering a blank job", async () => {
  await assert.rejects(loadRecruiterJob(job.id, async (path) => {
    if (path === "/recruiter/jobs/job-1") throw Object.assign(new Error("Failure"), { status: 500 });
    return path === "/recruiter/jobs" ? [{ id: job.id }] : {};
  }), /incomplete details/);
});
