import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const source = ts.transpileModule(
    readFileSync(
      new URL(`../components/recruiter/${file}`, import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const exports = {};
  new Function("require", "exports", source)((id) => {
    if (id in mocks) return mocks[id];
    return require(id);
  }, exports);
  return exports.default;
}
const Highlight = load("CandidateHighlight.tsx");
const highlight = (text, query) =>
  renderToStaticMarkup(React.createElement(Highlight, { text, query }));

test("search highlighting preserves case and treats C++ as literal text", () => {
  const html = highlight("C++ and c++", " C++ ");
  assert.equal((html.match(/<mark /g) || []).length, 2);
  assert.match(html, />C\+\+<\/mark>/);
  assert.match(html, />c\+\+<\/mark>/);
});

test("blank or unmatched searches preserve plain text", () => {
  assert.equal(highlight("Jordan Lee", " "), "Jordan Lee");
  assert.equal(highlight("Jordan Lee", "React"), "Jordan Lee");
});

test("candidate text stays escaped, including inside highlighted matches", () => {
  const html = highlight("<script>alert(1)</script>", "<script>");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

const passthrough = ({ children }) =>
  React.createElement("span", null, children);
const mocks = {
  "next/navigation": {
    useRouter: () => ({}),
    useSearchParams: () => new URLSearchParams(),
  },
  "next/link": ({ children, ...props }) =>
    React.createElement("a", props, children),
  "@/lib/actions/jobs": {},
  "./candidates-pipeline.module.css": { workspace: "workspace" },
  "@/lib/semantic-match": { calculateSupportedOverallSimilarity: () => 0.85 },
  "@/lib/candidate-pagination": {
    paginateCandidates: (items) => ({
      items,
      page: 1,
      pageCount: 1,
      start: 0,
      end: items.length,
    }),
  },
  "./candidate-review-utils": {
    candidateStages: [{ id: "APPLIED", label: "Applied" }],
  },
  "./CandidateHighlight": { default: Highlight, __esModule: true },
  "@/components/recruiter/KanbanView": () => null,
  "@/components/recruiter/CandidateDetailDrawer": () => null,
  "@/components/recruiter/CandidatePagination": () => null,
  "@/components/ui/avatar": {
    Avatar: passthrough,
    AvatarFallback: passthrough,
    AvatarImage: () => null,
  },
  "@/components/ui/badge": { Badge: passthrough },
  "@/components/ui/label": {
    Label: ({ children, ...props }) =>
      React.createElement("label", props, children),
  },
  "@/components/ui/input": {
    Input: (props) => React.createElement("input", props),
  },
  "@/components/ui/button": {
    Button: ({ children, asChild, ...props }) => {
      delete props.variant;
      delete props.size;
      return asChild
        ? children
        : React.createElement("button", props, children);
    },
  },
  "@/components/ui/select": {
    Select: passthrough,
    SelectTrigger: ({ children, ...props }) =>
      React.createElement("button", { ...props, role: "combobox" }, children),
    SelectValue: () => null,
    SelectContent: () => null,
    SelectItem: passthrough,
  },
  "@/components/ui/popover": {
    Popover: passthrough,
    PopoverContent: () => null,
    PopoverTrigger: passthrough,
  },
};
const Pipeline = load("CandidatesPipeline.tsx", mocks);
const html = renderToStaticMarkup(
  React.createElement(Pipeline, {
    jobs: [
      {
        id: "job-1",
        title: "Frontend Engineer",
        workplaceType: "REMOTE",
        jobType: "FULL_TIME",
        totalApplicants: 1,
      },
    ],
    selectedJobId: "all",
    candidates: [
      {
        candidateId: "candidate-1",
        applicationId: "app-1",
        name: "Jordan Lee",
        status: "APPLIED",
        skills: [],
      },
    ],
  }),
);

test("listing exposes named controls and selected states", () => {
  for (const name of [
    "Search job listings",
    "Search candidates by name, skill or title",
    "Filter by application stage",
    "Sort candidates",
    "Candidate display",
  ]) {
    assert.ok(html.includes(`aria-label="${name}"`), name);
  }
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('aria-pressed="false"'));
  assert.ok(html.includes('role="status"'));
  assert.ok(html.includes('aria-busy="false"'));
});

test("table retains table semantics with native, named review actions", () => {
  assert.ok(html.includes("<caption"));
  assert.ok(html.includes('scope="col"'));
  assert.ok(html.includes('aria-haspopup="dialog"'));
  assert.match(html, /aria-label="Review Jordan Lee&#x27;s application"/);
  assert.ok(
    html.includes(
      'aria-label="Preview Jordan Lee’s profile (opens in a new tab)"',
    ),
  );
  assert.ok(!/<tr[^>]+(?:tabindex|role="button")/i.test(html));
  assert.ok(html.includes("85%"));
});
