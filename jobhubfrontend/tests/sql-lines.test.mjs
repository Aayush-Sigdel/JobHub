import test from "node:test";
import assert from "node:assert/strict";
import { sqlLinesForSubmission } from "../lib/task/sql-lines.ts";

test("sends each editor line as one list item, preserving order", () => {
  assert.deepEqual(sqlLinesForSubmission("SELECT * FROM employees;\nSELECT * FROM departments;"), [
    "SELECT * FROM employees;",
    "SELECT * FROM departments;",
  ]);
  assert.deepEqual(sqlLinesForSubmission("SELECT *\nFROM employees"), ["SELECT *", "FROM employees"]);
});

test("does not split semicolons or change quoted content within a line", () => {
  assert.deepEqual(sqlLinesForSubmission("SELECT 'a;b'; SELECT 'c';"), ["SELECT 'a;b'; SELECT 'c';"]);
});

test("handles Windows newlines and skips blank lines", () => {
  assert.deepEqual(sqlLinesForSubmission("  SELECT 1;\r\n \r\n SELECT 2;\rSELECT 3;\n"), ["SELECT 1;", "SELECT 2;", "SELECT 3;"]);
  assert.deepEqual(sqlLinesForSubmission(" \r\n\n"), []);
});
