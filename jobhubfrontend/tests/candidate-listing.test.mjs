import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import * as semanticMatch from "../lib/semantic-match.ts";
import * as pagination from "../lib/candidate-pagination.ts";

const require = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const exports = {};
  const source = ts.transpileModule(
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  new Function("require", "exports", source)(
    (id) => (id in mocks ? mocks[id] : require(id)),
    exports,
  );
  return exports;
}
const { filterCandidates } = load("lib/candidate-listing.ts", {
  "./semantic-match": semanticMatch,
});
const defaults = {
  search: "",
  status: "ALL",
  minMatch: "",
  fromDate: "",
  toDate: "",
  sort: "match",
};
const makeCandidate = (overrides = {}) => ({
  candidateId: "candidate-1",
  applicationId: "application-1",
  name: "Amina Hassan",
  title: "Frontend engineer",
  email: "amina@example.test",
  skills: [],
  ...overrides,
});

test("search finds skills, email and title with literal punctuation and case-insensitive matching", () => {
  const candidate = makeCandidate({ skills: [{ id: "cpp", name: "C++" }] });
  for (const search of [" c++ ", "AMINA@", "frontend", "hassan"]) {
    assert.deepEqual(filterCandidates([candidate], { ...defaults, search }), [
      candidate,
    ]);
  }
  assert.deepEqual(
    filterCandidates([candidate], { ...defaults, search: "Python" }),
    [],
  );
});

test("stage and score filters combine, without treating missing scores as zero", () => {
  const applied = makeCandidate({ platformSimilarity: 0.8 });
  const shortlisted = makeCandidate({
    candidateId: "second",
    status: "SHORTLISTED",
    platformSimilarity: 0.9,
  });
  const missing = makeCandidate({
    candidateId: "missing",
    status: "SHORTLISTED",
  });
  assert.deepEqual(
    filterCandidates([applied, shortlisted, missing], {
      ...defaults,
      status: "SHORTLISTED",
      minMatch: "75",
    }),
    [shortlisted],
  );
  assert.deepEqual(
    filterCandidates([applied, shortlisted], {
      ...defaults,
      status: "APPLIED",
    }),
    [applied],
  );
  assert.deepEqual(
    filterCandidates([missing], { ...defaults, minMatch: "0" }),
    [],
  );
});

test("date filters include the whole selected day and exclude missing dates", () => {
  const start = makeCandidate({ appliedAt: "2026-09-20T00:00:00" });
  const end = makeCandidate({
    candidateId: "end",
    appliedAt: "2026-09-20T23:59:59.999",
  });
  const outside = makeCandidate({
    candidateId: "outside",
    appliedAt: "2026-09-21T00:00:00",
  });
  const missing = makeCandidate({ candidateId: "missing" });
  assert.deepEqual(
    filterCandidates([start, end, outside, missing], {
      ...defaults,
      fromDate: "2026-09-20",
      toDate: "2026-09-20",
    }),
    [start, end],
  );
  assert.deepEqual(
    filterCandidates([missing], { ...defaults, toDate: "2026-09-20" }),
    [],
  );
});

test("sorting keeps unscored candidates last and leaves the source array untouched", () => {
  const missing = makeCandidate({ name: "Zoe", candidateId: "missing" });
  const low = makeCandidate({
    name: "Bea",
    platformSimilarity: 0.4,
    appliedAt: "2026-09-21",
  });
  const high = makeCandidate({
    name: "Amina",
    candidateId: "high",
    platformSimilarity: 0.9,
    appliedAt: "2026-09-20",
  });
  const source = Object.freeze([missing, low, high]);
  assert.deepEqual(filterCandidates(source, defaults), [high, low, missing]);
  assert.deepEqual(filterCandidates(source, { ...defaults, sort: "newest" }), [
    low,
    high,
    missing,
  ]);
  assert.deepEqual(filterCandidates(source, { ...defaults, sort: "name" }), [
    high,
    low,
    missing,
  ]);
  assert.deepEqual(source, [missing, low, high]);
});

const utils = load("components/recruiter/candidate-review-utils.ts", {
  "@/lib/semantic-match": semanticMatch,
});
const Highlight = load("components/recruiter/CandidateHighlight.tsx");
const wrap = ({ children, ...props }) =>
  React.createElement("span", props, children);
const Pagination = load("components/recruiter/CandidatePagination.tsx", {
  "@/lib/candidate-pagination": pagination,
  "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
  "@/components/ui/button": {
    Button: ({ children, ...props }) => {
      delete props.variant;
      delete props.size;
      return React.createElement("button", props, children);
    },
  },
}).default;
const List = load("components/recruiter/CandidateList.tsx", {
  "@/lib/semantic-match": semanticMatch,
  "@/lib/candidate-pagination": pagination,
  "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
  "./candidate-review-utils": utils,
  "./CandidatePagination": { __esModule: true, default: Pagination },
  "./CandidateHighlight": Highlight,
  "@/components/ui/avatar": {
    Avatar: wrap,
    AvatarFallback: wrap,
    AvatarImage: () => null,
  },
}).default;
const renderList = (props) =>
  renderToStaticMarkup(
    React.createElement(List, {
      page: 1,
      pageSize: 10,
      onPageChange() {},
      onPageSizeChange() {},
      onSelect() {},
      ...props,
    }),
  );

test("a recreated list renders the workspace's saved page and page size", () => {
  const candidates = Array.from({ length: 31 }, (_, i) =>
    makeCandidate({
      candidateId: `candidate-${i}`,
      applicationId: `app-${i}`,
      name: `Applicant ${i + 1}`,
    }),
  );
  const props = { candidates, page: 2, pageSize: 25 };
  const before = renderList(props);
  const after = renderList(props);
  assert.equal(before, after);
  assert.ok(after.includes("Applicant 26"));
  assert.ok(after.includes("Applicant 31"));
  assert.ok(!after.includes("Applicant 25"));
  assert.ok(after.includes("Showing 26–31 of 31 applications"));
});

test("a shrinking filtered list clamps to a valid page", () => {
  const html = renderList({ candidates: [makeCandidate()], page: 3 });
  assert.ok(html.includes("Amina Hassan"));
  assert.ok(html.includes("Showing 1–1 of 1 applications"));
  assert.match(html, /aria-label="Next candidate page" disabled=""/);
});

test("matched skills remain visible beyond the usual three-skill preview", () => {
  const candidate = makeCandidate({
    skills: ["HTML", "CSS", "TypeScript", "React"].map((name) => ({
      id: name,
      name,
    })),
  });
  const html = renderList({ candidates: [candidate], search: "react" });
  assert.match(html, /<mark[^>]*>React<\/mark>/);
  assert.deepEqual(
    candidate.skills.map(({ name }) => name),
    ["HTML", "CSS", "TypeScript", "React"],
  );
});

test("email matches are explained even when a candidate has a job title", () => {
  const html = renderList({ candidates: [makeCandidate()], search: "amina@" });
  assert.match(html, /<mark[^>]*>amina@<\/mark>/);
  assert.ok(html.includes('data-candidate-review="application-1"'));
});

const Card = load("components/recruiter/CandidateCard.tsx", {
  "next/link": ({ children, ...props }) =>
    React.createElement("a", props, children),
  "./candidate-review-utils": utils,
  "./CandidateHighlight": Highlight,
  "@/components/ui/avatar": {
    Avatar: wrap,
    AvatarFallback: wrap,
    AvatarImage: () => null,
  },
}).default;
const Board = load("components/recruiter/KanbanView.tsx", {
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
  "@/lib/actions/recruiter": {},
  "@/lib/candidate-pagination": pagination,
  "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
  "./CandidateCard": { __esModule: true, default: Card },
  "./CandidatePagination": { __esModule: true, default: Pagination },
  "./candidate-review-utils": utils,
  "./candidate-listing.module.css": { listing: "listing" },
}).default;

test("Kanban cards offer a named move control without the current stage as a destination", () => {
  const html = renderToStaticMarkup(
    React.createElement(Card, {
      candidate: makeCandidate({ status: "SHORTLISTED", allTasksPassed: true }),
      onStageChange() {},
    }),
  );
  assert.ok(html.includes('aria-label="Move Amina Hassan to stage"'));
  assert.ok(html.includes('value="ACCEPTED"'));
  assert.ok(!html.includes('value="SHORTLISTED"'));
  assert.ok(html.includes("No submissions"));
  assert.ok(!html.includes("Passed All"));
});

test("Kanban move controls are disabled during saves and without an application id", () => {
  for (const props of [
    { candidate: makeCandidate(), isPending: true },
    { candidate: makeCandidate({ applicationId: undefined }) },
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(Card, { ...props, onStageChange() {} }),
    );
    assert.match(html, /<select[^>]*disabled=""/);
  }
});

test("Kanban preserves controlled lane pagination and retains keyboard alternatives without duplicate stage navigation", () => {
  const candidates = Array.from({ length: 8 }, (_, i) =>
    makeCandidate({
      applicationId: `board-${i}`,
      candidateId: `board-${i}`,
      name: `Board applicant ${i + 1}`,
      status: "APPLIED",
    }),
  );
  const render = () =>
    renderToStaticMarkup(
      React.createElement(Board, {
        candidates,
        stagePages: { APPLIED: 2 },
        onCandidateSelect() {},
        onStagePageChange() {},
      }),
    );
  const html = render();
  assert.ok(html.includes("Board applicant 7"));
  assert.ok(html.includes("Board applicant 8"));
  assert.ok(!html.includes("Board applicant 6"));
  assert.ok(html.includes('aria-label="Applied, 8 applications"'));
  assert.ok(html.includes('aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"'));
  assert.ok(!html.includes('aria-label="Jump to application stage"'));
  assert.match(html, /<p[^>]*class="sr-only">Focus a card/);
  assert.ok(render().includes("Board applicant 7"));
});
