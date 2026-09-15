import test from "node:test";
import assert from "node:assert/strict";
import { submittedCodePresentation } from "../lib/submitted-code.ts";

test("SQL code stored in backend query wrappers appears as highlighted queries", () => {
  const stored = "<query>SELECT * FROM users;</query><query>SELECT id FROM jobs;</query>";
  const view = submittedCodePresentation("SQL", stored);
  assert.equal(view.language, "SQL");
  assert.equal(view.code, "SELECT * FROM users;\n\nSELECT id FROM jobs;");
  assert.equal(submittedCodePresentation("SQL", "SELECT 1;").code, "SELECT 1;");
});

test("design and programming submissions select the matching code language", () => {
  assert.equal(submittedCodePresentation("DESIGN", "<main>Hello</main>").language, "HTML_CSS");
  assert.equal(submittedCodePresentation("PROGRAMMING", "class Solution { public int run() { return 1; } }").language, "JAVA");
  assert.equal(submittedCodePresentation("PROGRAMMING", "class Solution:\n    def run(self):\n        return 1").language, "PYTHON");
});
