import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { sqlStatementsFromPaste } from "../lib/task/sql-statements.ts";

const require = createRequire(import.meta.url);
const { outputText } = ts.transpileModule(
  readFileSync(
    new URL("../components/task/post/SqlStatementList.tsx", import.meta.url),
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

function harness(initial, kind = "setup", disabled = false) {
  let value = initial;
  let undo = null;
  let editors = [];
  let buttons = [];
  const exports = {};
  new Function("require", "exports", outputText)((id) => {
    if (id === "react")
      return {
        ...React,
        useState: () => [
          undo,
          (next) => {
            undo = next;
          },
        ],
      };
    if (id === "@/lib/task/sql-statements") return { sqlStatementsFromPaste };
    if (id === "@/components/task/CodeEditor")
      return (props) => {
        editors.push(props);
        return null;
      };
    if (id === "@/components/ui/button")
      return {
        Button: ({ variant, size, children, ...props }) => {
          buttons.push({ ...props, children });
          return React.createElement(
            "button",
            { ...props, "data-variant": variant, "data-size": size },
            children,
          );
        },
      };
    return require(id);
  }, exports);
  return {
    get value() {
      return value;
    },
    get editors() {
      return editors;
    },
    get buttons() {
      return buttons;
    },
    render() {
      editors = [];
      buttons = [];
      return renderToStaticMarkup(
        React.createElement(exports.SqlStatementList, {
          value,
          onChange: (next) => {
            value = next;
          },
          kind,
          disabled,
        }),
      );
    },
  };
}

test("a multiline query uses normal editor paste instead of creating blocks", () => {
  const list = harness([{ id: "one", sql: "" }]);
  list.render();
  const query = "SELECT name\nFROM employees\nWHERE id > 1";
  assert.equal(list.editors[0].onPaste(query, query), false);
  assert.equal(list.value.length, 1);
  assert.equal(list.editors[0].compact, true);
});

test("script paste splits statements in place, preserves adjacent blocks, and can undo", () => {
  const initial = [
    { id: "first", sql: "SELECT 0;" },
    { id: "target", sql: "SELECT 1;" },
    { id: "last", sql: "SELECT 4;" },
  ];
  const list = harness(initial);
  list.render();
  // CodeEditor supplies the complete document after replacing the selection.
  assert.equal(
    list.editors[1].onPaste(
      "SELECT 2;\nSELECT 3;",
      "SELECT 1;SELECT 2;\nSELECT 3;",
    ),
    true,
  );
  assert.deepEqual(
    list.value.map((item) => item.sql),
    ["SELECT 0;", "SELECT 1;", "SELECT 2;", "SELECT 3;", "SELECT 4;"],
  );
  assert.equal(list.value[1].id, "target");
  assert.equal(list.value[0], initial[0]);
  assert.equal(list.value.at(-1), initial[2]);
  assert.equal(new Set(list.value.map((item) => item.id)).size, 5);
  assert.match(list.render(), /Paste split into 3 statements/);
  list.buttons[0].onClick();
  assert.deepEqual(list.value, initial);
  assert.doesNotMatch(list.render(), /Undo split/);
});

test("editing after a split clears undo so it cannot discard subsequent work", () => {
  const list = harness([{ id: "one", sql: "" }]);
  list.render();
  list.editors[0].onPaste("SELECT 1;SELECT 2;", "SELECT 1;SELECT 2;");
  list.render();
  list.editors[1].onChange("SELECT 3;");
  assert.doesNotMatch(list.render(), /Undo split/);
  assert.equal(list.value[1].sql, "SELECT 3;");
});

test("assertions keep one required block and disabled lists lock the editor", () => {
  const list = harness([{ id: "one", sql: "" }], "assertion", true);
  list.render();
  assert.equal(list.editors[0].readOnly, true);
  assert.ok(list.buttons.every((button) => button.disabled));
  const active = harness([{ id: "one", sql: "" }], "assertion");
  active.render();
  assert.equal(active.buttons[0].disabled, true);
});
