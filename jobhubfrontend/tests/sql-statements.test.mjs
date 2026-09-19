import test from "node:test";
import assert from "node:assert/strict";
import { sqlStatementsFromPaste } from "../lib/task/sql-statements.ts";

test("splits semicolon-delimited SQL while preserving formatted statements", () => {
  assert.deepEqual(
    sqlStatementsFromPaste(`CREATE TABLE employees (
  id INT,
  name VARCHAR(100)
);
INSERT INTO employees VALUES (1, 'Ada');`),
    [
      "CREATE TABLE employees (\n  id INT,\n  name VARCHAR(100)\n);",
      "INSERT INTO employees VALUES (1, 'Ada');",
    ],
  );
});

test("keeps a formatted query without a semicolon in one block", () => {
  const sql = "SELECT id, name\nFROM employees\nWHERE id > 1\nORDER BY name";
  assert.deepEqual(sqlStatementsFromPaste(sql), [sql]);
});

test("keeps multiline assertions together and separates them only at semicolons", () => {
  assert.deepEqual(
    sqlStatementsFromPaste(
      "(SELECT COUNT(*)\n FROM candidate_result) = 3;\n\n(SELECT MAX(id) FROM candidate_result) = 9",
    ),
    [
      "(SELECT COUNT(*)\n FROM candidate_result) = 3;",
      "(SELECT MAX(id) FROM candidate_result) = 9",
    ],
  );
});

test("does not split adjacent lines without an explicit statement delimiter", () => {
  const sql = "SELECT 1\nSELECT 2";
  assert.deepEqual(sqlStatementsFromPaste(sql), [sql]);
});

test("handles escaped quotes, quoted identifiers and dollar-quoted bodies", () => {
  for (const sql of [
    "SELECT 'it''s; safe';",
    'SELECT "a;column" FROM "a;table";',
    "SELECT `a;column` FROM `table`;",
    "SELECT [a;column] FROM [table];",
    "SELECT $$text; on\nmultiple lines$$;",
    "SELECT $body$text; on\nmultiple lines$body$;",
  ]) {
    assert.deepEqual(sqlStatementsFromPaste(`${sql}\nSELECT 2;`), [
      sql,
      "SELECT 2;",
    ]);
  }
});

test("ignores nested comment delimiters and Windows line breaks", () => {
  const sql = "/* first ; /* nested ; */ end */\r\nSELECT 1;";
  assert.deepEqual(sqlStatementsFromPaste(`${sql}\r\n-- next ;\r\nSELECT 2`), [
    sql,
    "-- next ;\r\nSELECT 2",
  ]);
});

test("does not create blocks from empty or comment-only fragments", () => {
  for (const sql of ["", " \n\t", ";;;", "-- comment ;", "/* comment ; */"]) {
    assert.deepEqual(sqlStatementsFromPaste(sql), []);
  }
  assert.deepEqual(
    sqlStatementsFromPaste("SELECT 1;;;\n-- trailing comment;"),
    ["SELECT 1;"],
  );
});

test("does not split semicolons inside strings or comments", () => {
  assert.deepEqual(
    sqlStatementsFromPaste(
      "INSERT INTO notes VALUES ('keep; together'); -- ignore ; here\nSELECT 1;",
    ),
    [
      "INSERT INTO notes VALUES ('keep; together');",
      "-- ignore ; here\nSELECT 1;",
    ],
  );
});
