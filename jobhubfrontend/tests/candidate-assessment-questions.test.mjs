import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function actions(checkOwnership, fetchWithAuth) {
  const exports = {};
  const source = ts.transpileModule(
    readFileSync(
      new URL("../lib/actions/recruiter.ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  const mocks = {
    "@/lib/service-api": { fetchWithAuth },
    "@/lib/recruiter-job-loader": { loadRecruiterJob: checkOwnership },
    "next/cache": { revalidatePath() {} },
  };
  new Function("require", "exports", source)((id) => {
    if (!(id in mocks)) throw new Error(`Unexpected import: ${id}`);
    return mocks[id];
  }, exports);
  return exports;
}

test("questions are read only after recruiter ownership has been checked", async () => {
  const calls = [];
  const question = { id: "task-1", instructions: "Return the sum." };
  const { getCandidateAssessmentQuestionsAction } = actions(
    async (id) => {
      calls.push(`owner:${id}`);
      return { id };
    },
    async (url) => {
      calls.push(url);
      return {
        job: { id: "job-1" },
        programmingTask: question,
        applicantCount: 99,
      };
    },
  );
  const result = await getCandidateAssessmentQuestionsAction("job-1");
  assert.deepEqual(calls, ["owner:job-1", "/jobs/job-1"]);
  assert.deepEqual(result, {
    programmingTask: question,
    designTask: undefined,
    sqlTask: undefined,
  });
});

test("failed ownership checks prevent the question request", async () => {
  let requested = false;
  const { getCandidateAssessmentQuestionsAction } = actions(
    async () => {
      throw new Error("Forbidden");
    },
    async () => {
      requested = true;
    },
  );
  await assert.rejects(
    getCandidateAssessmentQuestionsAction("other-job"),
    /Forbidden/,
  );
  assert.equal(requested, false);
});

test("a mismatched job response is rejected", async () => {
  const { getCandidateAssessmentQuestionsAction } = actions(
    async (id) => ({ id }),
    async () => ({
      job: { id: "other-job" },
      programmingTask: { id: "wrong-task" },
    }),
  );
  await assert.rejects(
    getCandidateAssessmentQuestionsAction("job-1"),
    /could not be loaded/,
  );
});
