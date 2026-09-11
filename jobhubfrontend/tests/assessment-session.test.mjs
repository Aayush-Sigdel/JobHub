import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL("../components/task/AssessmentSession.tsx", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
});
const exports = {};
const trackingOptions = [];
new Function("require", "exports", outputText)((id) => {
  if (id === "@/lib/hooks/use-tab-lock")
    return {
      useTabLock: (options) => {
        trackingOptions.push(options);
        return { tabSwitchCount: 0 };
      },
    };
  if (id === "@/components/ui/button")
    return {
      Button: ({ asChild, variant, children, ...props }) =>
        asChild
          ? children
          : React.createElement(
              "button",
              { ...props, "data-variant": variant },
              children,
            ),
    };
  if (id === "next/link")
    return function MockLink({ children, ...props }) {
      return React.createElement("a", props, children);
    };
  return require(id);
}, exports);

function render(overrides = {}) {
  trackingOptions.length = 0;
  const html = renderToStaticMarkup(
    React.createElement(
      exports.AssessmentSession,
      {
        jobId: "job-one",
        taskId: "task-one",
        title: "Build a solution",
        kind: "Programming",
        monitored: true,
        warningLimit: 3,
        completed: false,
        ...overrides,
      },
      React.createElement("div", null, "IDE-CONTENT"),
    ),
  );
  return { html, options: trackingOptions.at(-1) };
}

for (const kind of ["HTML & CSS", "Programming", "SQL"]) {
  test(`${kind} requires Start Assignment and explains monitoring before exposing the editor`, () => {
    const { html, options } = render({ kind });
    assert.match(html, /Start Assignment/);
    assert.match(html, /Before you start/);
    assert.match(html, /browser windows, or apps/);
    assert.match(html, /warning limit is 3/);
    assert.match(html, /fullscreen/);
    assert.doesNotMatch(html, /IDE-CONTENT/);
    assert.equal(options.enabled, false);
    assert.equal(options.initialCount, 0);
  });
}

test("practice and unmonitored assignments open without a monitoring gate", () => {
  for (const override of [{ monitored: false }, { jobId: null }]) {
    const { html, options } = render(override);
    assert.match(html, /IDE-CONTENT/);
    assert.doesNotMatch(html, /Start Assignment/);
    assert.equal(options.enabled, false);
  }
});

test("submitted assignments show results without restarting monitoring", () => {
  const { html, options } = render({ completed: true });
  assert.match(html, /IDE-CONTENT/);
  assert.doesNotMatch(html, /Start Assignment/);
  assert.equal(options.enabled, false);
});

test("different jobs and task types use separate saved assignment counts", () => {
  const keys = [
    render({ kind: "Programming" }).options.sessionKey,
    render({ kind: "SQL" }).options.sessionKey,
    render({ taskId: "task-two" }).options.sessionKey,
    render({ jobId: "job-two" }).options.sessionKey,
  ];
  assert.equal(new Set(keys).size, 4);
});
