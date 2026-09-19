import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { evaluationRequiresOverride } from "../lib/task/assessment-submission.ts";

const require = createRequire(import.meta.url);
const { outputText } = ts.transpileModule(
  readFileSync(
    new URL(
      "../components/task/AssessmentSubmissionPanel.tsx",
      import.meta.url,
    ),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  },
);
const exports = {};
new Function("require", "exports", outputText)((id) => {
  if (id === "@/lib/task/assessment-submission")
    return { evaluationRequiresOverride };
  if (id === "@/components/ui/button")
    return {
      Button: ({ asChild, variant, size, children, ...props }) =>
        asChild
          ? children
          : React.createElement(
              "button",
              { ...props, "data-variant": variant, "data-size": size },
              children,
            ),
    };
  if (id === "next/link")
    return function MockLink({ children, ...props }) {
      return React.createElement("a", props, children);
    };
  return require(id);
}, exports);

const passing = {
  taskId: "task-1",
  taskType: "SQL",
  passed: true,
  achievedScore: 3,
  requiredScore: 3,
};
function render(overrides = {}) {
  return renderToStaticMarkup(
    React.createElement(exports.AssessmentSubmissionPanel, {
      error: null,
      jobId: "job-1",
      busy: null,
      disabled: false,
      onSubmit() {},
      onRetry() {},
      onEdit() {},
      ...overrides,
    }),
  );
}

test("untested code has guidance but no submission action or modal", () => {
  const html = render();
  assert.match(html, /Test your code when/);
  assert.doesNotMatch(html, /Submit solution|Send anyway|role="dialog"/);
});

test("passing code has explicit inline submission and application guidance", () => {
  const html = render({ result: passing });
  assert.match(html, /Ready to submit/);
  assert.match(html, /Keep editing/);
  assert.match(html, /Submit solution/);
  assert.match(html, /application separately/);
  assert.doesNotMatch(html, /Send anyway|role="dialog"/);
  assert.doesNotMatch(
    render({ result: passing, jobId: null }),
    /application separately/,
  );
});

test("failed and low-score code offers editing or send anyway", () => {
  for (const result of [
    { ...passing, passed: false, message: "Syntax error" },
    { ...passing, achievedScore: 1 },
  ]) {
    const html = render({ result });
    assert.match(html, /Some checks did not pass/);
    assert.match(html, /Keep editing/);
    assert.match(html, /Send anyway/);
    assert.doesNotMatch(html, /Submit solution/);
  }
  assert.match(
    render({ result: { ...passing, passed: false, message: "Syntax error" } }),
    /<details[^>]*open=""/,
  );
});

test("evaluation service failure offers retry without untested submission", () => {
  const html = render({ error: "Service unavailable" });
  assert.match(html, /role="alert"/);
  assert.match(html, /Try testing again/);
  assert.doesNotMatch(html, /Submit solution|Send anyway/);
});

test("saved results link back to the job and cannot be submitted again", () => {
  const html = render({ result: { ...passing, id: "saved-1" } });
  assert.match(html, /Assessment submitted/);
  assert.match(html, /href="\/find-job\/job-1"/);
  assert.doesNotMatch(html, /Submit solution|Send anyway|Keep editing/);
});

test("pending submissions disable both actions", () => {
  const html = render({ result: passing, busy: "submitting", disabled: true });
  assert.match(html, /Submitting your solution/);
  assert.equal((html.match(/<button[^>]*disabled=""/g) ?? []).length, 2);
});
