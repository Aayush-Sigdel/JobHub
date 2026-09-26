import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import {
  calculateSupportedOverallSimilarity,
  getSimilaritySources,
  getSimilarityContributions,
} from "../lib/semantic-match.ts";
import { assessmentQuestion } from "../lib/assessment-question.ts";
import * as semanticMatch from "../lib/semantic-match.ts";
import { SNAPSHOT_SUMMARY_LIMIT } from "../lib/snapshot-replay.ts";

const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const exports = {};
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
  new Function("require", "exports", source)(
    (id) => (id in mocks ? mocks[id] : require(id)),
    exports,
  );
  return exports;
}
const utils = load("candidate-review-utils.ts", {
  "@/lib/semantic-match": { calculateSupportedOverallSimilarity },
});
const wrap = (tag) =>
  function MockElement({ children, ...props }) {
    return React.createElement(tag, props, children);
  };
const ui = {
  "./candidate-review-utils": utils,
  "@/components/ui/button": {
    Button: ({ children, ...props }) => {
      delete props.variant;
      return React.createElement("button", props, children);
    },
  },
};
const Detail = load("CandidateDetailDrawer.tsx", {
  ...ui,
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
  "next/link": wrap("a"),
  "@/lib/actions/recruiter": { updateApplicationStatusAction: async () => {} },
  "./candidate-review.module.css": {},
  "@/components/ui/sheet": {},
  "@/components/ui/avatar": {
    Avatar: wrap("span"),
    AvatarFallback: wrap("span"),
    AvatarImage: () => null,
  },
  "@/components/ui/tabs": {
    Tabs: ({ children }) => children,
    TabsList: ({ children, ...props }) =>
      React.createElement("div", { ...props, role: "tablist" }, children),
    TabsTrigger: ({ children, value, ...props }) =>
      React.createElement(
        "button",
        { ...props, role: "tab", "aria-selected": value === "basic" },
        children,
      ),
    TabsContent: ({ children, value }) => (value === "basic" ? children : null),
  },
  "./CandidateOverview": () => null,
  "./CandidateAssessments": () => null,
  "./CandidateMatchTimeline": () => null,
}).default;
const Question = load("CandidateAssessmentQuestion.tsx", {
  "@/components/jobs/JobMarkdown": ({ children }) =>
    React.createElement("p", null, children),
}).default;
let questionState = {};
const Assessments = load("CandidateAssessments.tsx", {
  ...ui,
  "./SubmittedAnswer": ({ submission }) =>
    React.createElement(
      "pre",
      { "aria-label": `Submitted code ${submission.id}` },
      "Candidate code",
    ),
  "./CandidateAssessmentQuestion": Question,
  "@/lib/assessment-question": { assessmentQuestion },
  "@/lib/actions/recruiter": {},
  "next-auth/react": {
    useSession: () => ({
      data: { user: { id: "employer-1" } },
      status: "authenticated",
    }),
  },
  "@tanstack/react-query": { useQuery: () => questionState },
}).default;
const Overview = load("CandidateOverview.tsx", ui).default;
const candidate = {
  candidateId: "candidate-1",
  applicationId: "application-1",
  name: "Jordan Lee",
  title: "Engineer",
  jobTitle: "Frontend Engineer",
  email: "jordan@example.test",
  status: "APPLIED",
  platformSimilarity: 0.85,
  skills: [{ id: "react", name: "React" }],
  experiences: [],
  educations: [],
  socialLinks: [],
  programmingSubmission: {
    id: "code-1",
    taskType: "PROGRAMMING",
    taskId: "programming-1",
    passed: true,
    achievedScore: 90,
    requiredScore: 70,
  },
  sqlSubmission: {
    id: "sql-1",
    taskType: "SQL",
    taskId: "sql-1",
    passed: false,
    achievedScore: 40,
    requiredScore: 70,
  },
};
const render = (Component, props) =>
  renderToStaticMarkup(React.createElement(Component, props));
const detail = (changes = {}) =>
  render(Detail, {
    candidate: { ...candidate, ...changes },
    jobId: "job-1",
    embedded: true,
    open: true,
    onOpenChange() {},
  });

test("review summary names the application, match, results and detail navigation", () => {
  const html = detail();
  for (const value of [
    "Jordan Lee",
    "Frontend Engineer",
    "85%",
    "1 of 2 passed",
    'href="mailto:jordan@example.test"',
    'aria-label="Candidate detail sections"',
  ])
    assert.ok(html.includes(value), value);
  assert.match(html, /<footer[\s\S]*aria-label="Update application stage"/);
  assert.ok(html.includes('role="status"'));
});

test("available decisions follow the application stage", () => {
  const applied = detail();
  for (const action of ["Shortlist", "Start review", "Reject"])
    assert.match(applied, new RegExp(`>${action}</button>`));
  assert.ok(!applied.includes(">Accept</button>"));
  const shortlisted = detail({ status: "SHORTLISTED" });
  assert.ok(shortlisted.includes(">Accept</button>"));
  assert.ok(shortlisted.includes(">Return to review</button>"));
  const accepted = detail({ status: "ACCEPTED" });
  assert.ok(!accepted.includes(">Reject</button>"));
  assert.ok(accepted.includes(">Return to review</button>"));
});

test("missing application identity disables decisions and explains why", () => {
  const html = detail({ applicationId: undefined });
  assert.ok(
    html.includes("Stage changes are unavailable for this application."),
  );
  assert.equal((html.match(/disabled=""/g) || []).length, 3);
});

test("missing evidence is described without inventing a score or pass result", () => {
  const html = detail({
    platformSimilarity: undefined,
    programmingSubmission: undefined,
    sqlSubmission: undefined,
  });
  assert.ok(html.includes("Not available"));
  assert.ok(html.includes("No submissions"));
  assert.ok(!html.includes("0 of 0 passed"));
});

test("assessment questions and answers are separate named regions with answers immediately visible", () => {
  const html = render(Assessments, { candidate });
  assert.ok(html.includes('aria-label="Programming question"'));
  assert.ok(html.includes('aria-label="Programming candidate answer"'));
  assert.ok(html.includes('aria-label="SQL candidate answer"'));
  assert.ok(html.includes('aria-label="Submitted code code-1"'));
  assert.ok(html.includes("Required to pass"));
  assert.ok(html.includes("Not passed"));
});

test("overview marks current roles and exposes skills as a list", () => {
  const html = render(Overview, {
    candidate: {
      ...candidate,
      experiences: [
        {
          id: "work",
          title: "Engineer",
          company: "Example",
          isCurrentRole: true,
        },
      ],
      socialLinks: [
        { id: "unsafe", platform: "WEBSITE", url: "javascript:alert(1)" },
      ],
    },
    onTabChange() {},
  });
  assert.ok(html.includes('aria-label="Candidate skills"'));
  assert.ok(html.includes("Current role"));
  assert.ok(!html.includes("javascript:"));
});

const programmingQuestion = {
  id: "programming-1",
  title: "Sum two numbers",
  instructions: "Return the sum of the two inputs.",
  methodName: "sum",
  parameters: [
    { name: "a", type: "INT" },
    { name: "b", type: "INT" },
  ],
  returnType: "INT",
  exampleTestCases: [{ input: [2, 3], expectedOutput: 5 }],
};

test("assessment questions match submission type and task identity", () => {
  const questions = {
    programmingTask: programmingQuestion,
    sqlTask: { id: "sql-1", title: "Query orders" },
    designTask: { id: "design-1", title: "Recreate a design" },
  };
  assert.equal(
    assessmentQuestion(questions, candidate.programmingSubmission),
    programmingQuestion,
  );
  assert.equal(
    assessmentQuestion(questions, candidate.sqlSubmission).title,
    "Query orders",
  );
  assert.equal(
    assessmentQuestion(questions, { taskType: "DESIGN", taskId: "design-1" })
      .title,
    "Recreate a design",
  );
  assert.equal(
    assessmentQuestion(questions, {
      taskType: "PROGRAMMING",
      taskId: "old-task",
    }),
    null,
  );
  assert.equal(
    assessmentQuestion(undefined, candidate.programmingSubmission),
    null,
  );
});

test("assessment review displays the matching question and examples", () => {
  questionState = { data: { programmingTask: programmingQuestion } };
  const html = render(Assessments, { candidate, jobId: "job-1" });
  assert.ok(html.includes("Sum two numbers"));
  assert.ok(html.includes("Return the sum of the two inputs."));
  assert.ok(html.includes("Input: [2,3]"));
  assert.ok(html.includes("Expected output: 5"));
  questionState = {};
});

test("a replaced question is never presented as the submitted assessment", () => {
  questionState = {
    data: { programmingTask: { ...programmingQuestion, id: "replacement" } },
  };
  const html = render(Assessments, { candidate, jobId: "job-1" });
  assert.ok(!html.includes("Sum two numbers"));
  assert.ok(
    html.includes("The question linked to this submission is not available."),
  );
  questionState = {};
});

test("question failure preserves assessment scores and answer controls", () => {
  questionState = { isError: true };
  const html = render(Assessments, { candidate, jobId: "job-1" });
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes("Try loading questions again"));
  assert.ok(html.includes("Achieved score"));
  assert.ok(html.includes('aria-label="Programming candidate answer"'));
  questionState = {};
});

let reducedMotion = true;
const motionMocks = {
  useReducedMotion: () => reducedMotion,
  motion: new Proxy(
    {},
    {
      get: (_, tag) =>
        function MockMotion({ children, ...props }) {
          delete props.initial;
          delete props.animate;
          delete props.transition;
          return React.createElement(tag, props, children);
        },
    },
  ),
};
const Evidence = load("CandidateEvidenceReport.tsx", {
  "motion/react": motionMocks,
  "@/lib/semantic-match": semanticMatch,
  "@/lib/snapshot-replay": { SNAPSHOT_SUMMARY_LIMIT },
  "./candidate-review-utils": utils,
}).default;
const Match = load("CandidateMatchTimeline.tsx", {
  ...ui,
  "@/lib/semantic-match": { getSimilaritySources, getSimilarityContributions },
  "@tanstack/react-query": { useQuery: () => ({ data: [] }) },
  "@/lib/actions/recruiter": {},
  "./CandidateEvidenceReport": Evidence,
}).default;

test("matching explains source weight and contribution without treating missing scores as zero", () => {
  const html = render(Match, { candidate, jobId: "job-1" });
  assert.ok(html.includes("85%"));
  assert.ok(html.includes("100%"));
  assert.ok(html.includes("85 pts"));
  assert.ok(html.includes('scope="row"'));
  assert.ok(!html.includes("GitHub</th>"));
});

test("reduced motion shows saved evidence immediately and rejects executable source URLs", () => {
  const html = render(Evidence, {
    snapshots: [
      {
        platform: "GITHUB",
        summary: { repoCount: 4, languages: ["Java", "Python", "Go", "Rust"] },
        aiCoolFeedItems: ["Repository: accessible-ui"],
      },
    ],
    match: { githubSimilarity: 0.8 },
    socialLinks: [{ platform: "GITHUB", url: "javascript:alert(1)" }],
  });
  assert.ok(html.includes("Repositories"));
  assert.ok(html.includes("accessible-ui"));
  assert.ok(html.includes("Show 1 more"));
  assert.ok(html.includes("Rust"));
  assert.ok(!html.includes("Analyzing evidence"));
  assert.ok(!html.includes("javascript:"));
});

test("matching preserves the animated review before revealing source summaries", () => {
  reducedMotion = false;
  try {
    const html = render(Evidence, {
      snapshots: [
        {
          platform: "GITHUB",
          summary: { repoCount: 4 },
          aiCoolFeedItems: ["Repository: accessible-ui"],
        },
      ],
      match: { githubSimilarity: 0.8 },
    });
    assert.ok(html.includes("Reviewing saved evidence"));
    assert.ok(html.includes("Show summary now"));
    assert.ok(html.includes("Opening the saved source snapshot"));
    assert.ok(!html.includes("Repositories"));
  } finally {
    reducedMotion = true;
  }
});

test("profile sections have distinct accessible headings", () => {
  const html = render(Overview, { candidate, onTabChange() {} });
  for (const heading of [
    "Cover letter",
    "Skills",
    "Work experience",
    "Education",
    "Contact &amp; links",
    "Session activity",
  ]) {
    assert.match(html, new RegExp(`<h4[^>]+>${heading}</h4>`));
  }
  assert.equal((html.match(/<section aria-labelledby=/g) || []).length, 6);
});
