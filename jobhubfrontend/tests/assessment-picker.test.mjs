import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(path, mocks) {
  const exports = {};
  const code = ts.transpileModule(
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  new Function("require", "exports", code)(
    (id) => (id in mocks ? mocks[id] : require(id)),
    exports,
  );
  return exports.default;
}
const cn = (...values) => values.filter(Boolean).join(" ");
const JobMarkdown = load("components/jobs/JobMarkdown.tsx", {
  "react-markdown": Markdown,
  "remark-gfm": remarkGfm,
  "@/lib/utils": { cn },
});
let libraryState;
const plain =
  (tag) =>
  function MockElement({ children }) {
    return React.createElement(tag, null, children);
  };
const Picker = load("components/post-job/AssessmentPicker.tsx", {
  "next/dynamic": () => () => null,
  "@/components/jobs/JobMarkdown": JobMarkdown,
  "@tanstack/react-query": { useQuery: () => libraryState },
  "@/lib/actions/recruiter": {},
  "@/lib/utils": { cn },
  "./job-post-form.module.css": { form: "form" },
  "@/components/ui/dialog": {
    Dialog: plain("div"),
    DialogContent: plain("div"),
    DialogHeader: plain("header"),
    DialogTitle: plain("h2"),
    DialogDescription: plain("p"),
  },
  "@/components/ui/input": {
    Input: (props) => React.createElement("input", props),
  },
  "@/components/ui/button": {
    Button: ({ children, ...props }) => {
      delete props.variant;
      delete props.size;
      return React.createElement("button", props, children);
    },
  },
});
const emptyLibrary = { designTasks: [], programmingTasks: [], sqlTasks: [] };
function render(tasks, queryOverrides = {}) {
  libraryState = {
    data: { ...emptyLibrary, designTasks: tasks },
    isPending: false,
    isError: false,
    isFetching: false,
    refetch() {},
    ...queryOverrides,
  };
  return renderToStaticMarkup(
    React.createElement(Picker, {
      value: { designTaskId: "", programmingTaskId: "", sqlTaskId: "" },
      onChange() {},
      library: emptyLibrary,
    }),
  );
}

test("public tasks expose their full formatted instructions separately from the selection label", () => {
  const html = render([
    {
      id: "public-task",
      title: "Build a settings screen",
      scope: "PUBLIC",
      instructions:
        "## Requirements\n\nCreate a responsive settings screen.\n\n[Reference](https://example.test/spec)\n\n## Submission\n\nInclude keyboard support and a mobile layout.",
    },
  ]);
  const article = html.match(/<article[^>]*>(.*?)<\/article>/s)?.[1];
  assert.ok(article);
  assert.ok(article.includes("Public"));
  assert.match(article, /<summary[^>]*>Read full description/);
  assert.match(article, /<h2>Requirements<\/h2>/);
  assert.ok(article.includes("Include keyboard support and a mobile layout."));
  assert.ok(article.includes('href="https://example.test/spec"'));
  const label = article.match(/<label[^>]*>(.*?)<\/label>/s)?.[1];
  assert.ok(label.includes('aria-label="Select Build a settings screen"'));
  assert.ok(!label.includes("Reference"));
  assert.ok(article.indexOf("</label>") < article.indexOf("<details"));
});

test("tasks without instructions have an explicit fallback instead of an empty disclosure", () => {
  const html = render([
    { id: "no-description", title: "Layout challenge", instructions: "  " },
  ]);
  assert.ok(html.includes("No description provided."));
  assert.ok(!html.includes("<details"));
});

test("failed library loads keep applying a selection disabled", () => {
  const html = render([], { isError: true });
  assert.ok(html.includes('role="alert"'));
  assert.match(html, /<button[^>]*disabled=""[^>]*>Apply selection<\/button>/);
});
