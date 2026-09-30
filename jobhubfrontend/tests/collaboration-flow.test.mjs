import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { projectFromDetail } from "../lib/collaboration.ts";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
function render(file, component, props = {}, state = {}) {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const source = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    new Function("require", "exports", source)((id) => {
      if (id.endsWith(".module.css")) return {};
      if (id === "react-markdown")
        return { __esModule: true, default: Markdown };
      if (id === "remark-gfm") return { __esModule: true, default: remarkGfm };
      if (id === "@/components/post-job/MarkdownEditor")
        return function MockMarkdownEditor({
          id,
          label,
          value,
          onChange,
          required,
          disabled,
        }) {
          return React.createElement("textarea", {
            id,
            "aria-label": label,
            value,
            required,
            disabled,
            onChange: (event) => onChange(event.target.value),
          });
        };
      if (id === "react")
        return {
          ...React,
          useState: (initial) =>
            React.useState(
              typeof initial === "string"
                ? (state.tabs?.[initial] ?? initial)
                : initial,
            ),
        };
      if (id === "next/link")
        return function MockLink({ children, ...attributes }) {
          return React.createElement("a", attributes, children);
        };
      if (id === "next/navigation")
        return {
          useRouter: () => ({}),
          useSearchParams: () => new URLSearchParams(state.params ?? ""),
          usePathname: () => state.path ?? "/collaborators/explore",
        };
      if (id === "@tanstack/react-query")
        return {
          useQuery: (options) => {
            state.onQuery?.(options);
            const { queryKey } = options;
            const kind = queryKey.includes("candidate-profile")
              ? "candidateProfile"
              : queryKey.includes("project-memberships")
                ? "ownerMemberships"
                : queryKey.includes("owner-inbox")
                  ? "ownerInbox"
                  : queryKey.includes("project")
                    ? "detail"
                    : queryKey.includes("suggestions")
                      ? "suggestions"
                      : "projects";
            return { data: [], refetch() {}, ...state[kind] };
          },
        };
      if (id === "@/lib/hooks/use-collaboration")
        return {
          useCollaborationIdentity: () => ({
            userId: "owner",
            userName: "Asha Sharma",
            enabled: true,
            ...state.identity,
          }),
          useOwnerMemberships: () => ({
            projects: { data: [], refetch() {}, ...state.ownedProjects },
            requests: {
              data: { memberships: [], failedProjects: [] },
              refetch() {},
              ...state.ownerRequests,
            },
          }),
          useMyMemberships: () => ({
            data: [],
            refetch() {},
            ...state.memberships,
          }),
          useRefreshCollaboration: () => () => {},
          CollaborationError: class extends Error {},
        };
      if (id.includes("/actions/")) return {};
      if (id === "./inbox-indicator")
        return { useInboxSeen: () => ({ seen: null, markSeen() {} }) };
      if (id.startsWith("@/components/ui/"))
        return new Proxy(
          {},
          {
            get: (_, name) =>
              name === "__esModule"
                ? true
                : ({ children, asChild, ...attributes }) => {
                    delete attributes.variant;
                    delete attributes.size;
                    return asChild
                      ? children
                      : React.createElement(
                          name === "Button"
                            ? "button"
                            : name === "Input"
                              ? "input"
                              : name === "Textarea"
                                ? "textarea"
                                : "div",
                          attributes,
                          children,
                        );
                  },
          },
        );
      if (id.startsWith("@/") || id.startsWith(".")) {
        const base = id.startsWith("@/")
          ? resolve(root, id.slice(2))
          : resolve(dirname(path), id);
        return load(
          /\.tsx?$/.test(base)
            ? base
            : base + (base.includes("/lib/") ? ".ts" : ".tsx"),
        );
      }
      return require(id);
    }, exports);
    return exports;
  }
  return renderToStaticMarkup(
    React.createElement(load(resolve(root, file))[component], props),
  );
}
const project = {
  id: "p1",
  title: "Study companion",
  description: "A shared learning app",
  ownerId: "owner",
  ownerName: "Owner",
  status: "RECRUITING",
  workplaceType: "REMOTE",
  activeMemberCount: 1,
  teamSize: 3,
  roles: [],
  members: [],
  isOwner: true,
};
const membership = {
  id: "m1",
  projectId: "joined-project",
  projectTitle: "Joined team",
  userId: "candidate",
  name: "Candidate",
  status: "ACTIVE",
  initiatedBy: "CANDIDATE",
  updatedAt: "2026-09-24T10:00:00Z",
};

test("navigation groups recommendations under Explore and removes People", () => {
  const html = render(
    "components/collaboration/collaboration-shell.tsx",
    "CollaborationShell",
    {},
    { path: "/collaborators/for-you" },
  );
  assert.doesNotMatch(html, /People|href="\/collaborators\/people"/);
  assert.match(html, /href="\/collaborators\/explore" aria-current="page"/);
  assert.match(html, /Requests/);
  assert.doesNotMatch(html, /<aside/);
});
test("collaboration has its own navigation, content landmark and return to jobs", () => {
  const html = render(
    "components/collaboration/collaboration-shell.tsx",
    "CollaborationShell",
    {
      children: React.createElement("p", null, "Project workspace"),
      profile: {
        name: "Asha Sharma",
        email: "asha@example.test",
        title: "Frontend engineer",
      },
    },
    { path: "/collaborators/my-projects" },
  );
  assert.match(html, /<header/);
  assert.match(html, /aria-label="JobHub collaboration home"/);
  assert.match(html, /href="\/find-job" aria-label="Back to jobs"/);
  assert.match(html, /aria-label="Open profile menu for Asha Sharma"/);
  assert.match(html, /asha@example.test/);
  assert.match(html, /href="\/candidate-profile"/);
  assert.match(html, /href="\/candidate-profile#collaboration-visibility"/);
  assert.match(html, /Appearance/);
  assert.match(html, /Sign out/);
  assert.match(html, /href="#collaboration-content"/);
  assert.match(
    html,
    /<main id="collaboration-content"[^>]*><p>Project workspace<\/p><\/main>/,
  );
  assert.match(html, /href="\/collaborators\/my-projects" aria-current="page"/);
  assert.match(html, /aria-label="Create project"/);
  assert.doesNotMatch(html, /Find Jobs|Track Applications|applicant-content/);
});
test("project discovery has useful empty and error states", () => {
  const empty = render(
    "components/collaboration/project-list.tsx",
    "ProjectList",
    { view: "browse" },
  );
  assert.match(empty, /No projects found/);
  assert.match(empty, /Reset filters/);
  assert.match(empty, /href="\/collaborators\/projects\/new"/);
  const error = render(
    "components/collaboration/project-list.tsx",
    "ProjectList",
    { view: "browse" },
    { projects: { error: new Error("Service unavailable") } },
  );
  assert.match(error, /role="alert"/);
  assert.doesNotMatch(error, /No projects found/);
});
test("Joined lists active memberships without inventing project details", () => {
  const html = render(
    "components/collaboration/project-list.tsx",
    "ProjectList",
    { view: "mine", initialMineTab: "joined" },
    {
      memberships: {
        data: [
          membership,
          {
            ...membership,
            id: "closed",
            projectTitle: "Closed team",
            status: "LEFT",
          },
        ],
      },
    },
  );
  assert.match(html, /Joined team/);
  assert.match(html, /href="\/collaborators\/projects\/joined-project"/);
  assert.doesNotMatch(html, /Closed team|open seats/);
});
test("Explore shows collaboration activity and links to the joined workspace", () => {
  const html = render(
    "components/collaboration/collaboration-explore.tsx",
    "CollaborationExplore",
    {
      profile: {
        name: "Asha Sharma",
        title: "Developer",
        skills: [{ name: "TypeScript" }],
        discoverable: true,
      },
    },
    {
      ownedProjects: { data: [project] },
      memberships: { data: [membership] },
      ownerRequests: {
        data: {
          memberships: [
            { ...membership, id: "new-request", status: "REQUESTED" },
          ],
          failedProjects: [],
        },
      },
    },
  );
  assert.match(html, /Welcome back, Asha/);
  assert.match(html, /id="project-feed"/);
  assert.match(html, /href="\/collaborators\/my-projects\?tab=joined"/);
  assert.match(html, /Your collaboration profile and activity/);
  assert.match(html, /TypeScript/);
  assert.match(html, /Project owners can discover your profile/);
  assert.match(html, /Recent activity/);
  assert.doesNotMatch(html, /unavailable/);
});
test("Explore does not turn unavailable activity into zero counts", () => {
  const html = render(
    "components/collaboration/collaboration-explore.tsx",
    "CollaborationExplore",
    { profile: null },
    {
      ownedProjects: { data: undefined, error: new Error("Unavailable") },
      memberships: { data: undefined, error: new Error("Unavailable") },
      ownerRequests: { data: undefined, error: new Error("Unavailable") },
    },
  );
  assert.equal(
    (html.match(/<span class="sr-only"> unavailable<\/span>/g) ?? []).length,
    3,
  );
  assert.match(html, /Activity is temporarily unavailable/);
  assert.match(html, /id="project-feed"/);
});
test("invitations, sent requests, and history show distinct membership states", () => {
  const data = [
    membership,
    {
      ...membership,
      id: "invite",
      status: "INVITED",
      initiatedBy: "OWNER",
      projectTitle: "Incoming team",
    },
    {
      ...membership,
      id: "request",
      status: "REQUESTED",
      projectTitle: "Waiting team",
    },
  ];
  for (const [section, shown, hidden] of [
    ["received", "Incoming team", "Waiting team"],
    ["sent", "Waiting team", "Incoming team"],
    ["history", "Joined team", "Waiting team"],
  ]) {
    const html = render(
      "components/collaboration/collaboration-inbox.tsx",
      "CollaborationInbox",
      {},
      { tabs: { received: section }, memberships: { data } },
    );
    assert.match(html, new RegExp(shown));
    assert.doesNotMatch(html, new RegExp(hidden));
  }
});
test("project owners see management navigation but visitors do not", () => {
  for (const isOwner of [true, false]) {
    const html = render(
      "components/collaboration/project-detail.tsx",
      "ProjectDetail",
      { id: "p1" },
      { detail: { data: { ...project, isOwner } } },
    );
    if (isOwner) {
      assert.match(html, /Recommended candidates/);
      assert.doesNotMatch(html, /Delete project|Request to join/);
    } else {
      assert.doesNotMatch(html, /Recommended candidates|Settings/);
      assert.match(html, /Request to join/);
    }
  }
});
test("full teams and closed recruitment get a relevant teammate empty state", () => {
  for (const [data, title] of [
    [{ ...project, activeMemberCount: 3 }, "Your team is full"],
    [{ ...project, status: "COMPLETED" }, "Recruitment is closed"],
  ]) {
    const html = render(
      "components/collaboration/project-detail.tsx",
      "ProjectTeamTools",
      { project: data },
    );
    assert.match(html, new RegExp(title));
    assert.doesNotMatch(html, /Invite to team/);
  }
});
test("legacy People links redirect to owned projects", () => {
  assert.match(
    readFileSync(
      resolve(root, "app/(collaboration)/collaborators/people/page.tsx"),
      "utf8",
    ),
    /redirect\("\/collaborators\/my-projects"\)/,
  );
});

test("the Team section includes the owner's real name and You even with no memberships", () => {
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectDetail",
    { id: "p1" },
    {
      params: "section=team",
      detail: { data: { ...project, ownerName: "Asha Sharma" } },
    },
  );
  const team = html.match(/aria-label="Project team"[\s\S]*?<\/section>/)?.[0];
  assert.ok(team);
  assert.match(team, /Asha Sharma/);
  assert.match(team, /You/);
  assert.match(team, /Owner/);
  assert.match(team, /href="\/candidate-profile"/);
});

test("the Team route shows the owner with a session-name fallback and no duplicate roster row", () => {
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectDetail",
    { id: "p1" },
    {
      params: "section=team",
      detail: {
        data: {
          ...project,
          ownerName: "",
          members: [{ userId: "owner", name: "" }],
        },
      },
    },
  );
  const team = html.match(/aria-label="Project team"[\s\S]*?<\/section>/)?.[0];
  assert.ok(team);
  assert.equal((team.match(/Asha Sharma/g) ?? []).length, 1);
  assert.doesNotMatch(html, /About<\/h2>/);
});

test("request review combines owner applications with personal invitations", () => {
  const html = render(
    "components/collaboration/collaboration-inbox.tsx",
    "CollaborationInbox",
    {},
    {
      memberships: {
        data: [
          {
            ...membership,
            status: "INVITED",
            initiatedBy: "OWNER",
            projectTitle: "Invited project",
          },
        ],
      },
      ownerRequests: {
        data: {
          memberships: [
            {
              ...membership,
              id: "request",
              status: "REQUESTED",
              projectTitle: "My project",
              project,
            },
          ],
          failedProjects: [],
        },
      },
    },
  );
  assert.match(html, /Invited project/);
  assert.match(html, /My project/);
  assert.match(html, /Join request received/);
  assert.match(html, /Invitation received/);
});

test("the request badge includes applications to owned projects", () => {
  const html = render(
    "components/collaboration/collaboration-shell.tsx",
    "CollaborationShell",
    {},
    {
      ownerRequests: {
        data: {
          memberships: [{ ...membership, status: "REQUESTED" }],
          failedProjects: [],
        },
      },
    },
  );
  assert.match(html, /Requests<span[^>]*>1<\/span>/);
});

test("a filled role identifies its teammate and cannot be requested", () => {
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectDetail",
    { id: "p1" },
    {
      identity: { userId: "visitor" },
      detail: {
        data: {
          ...project,
          isOwner: false,
          roles: [
            {
              id: "design",
              title: "Designer",
              filled: true,
              filledByName: "Rita",
              requiredSkills: [],
            },
          ],
        },
      },
    },
  );
  assert.match(html, /Filled by Rita/);
  assert.doesNotMatch(html, /Request this role/);
});

test("request loading failures are not presented as an empty inbox", () => {
  const html = render(
    "components/collaboration/collaboration-inbox.tsx",
    "CollaborationInbox",
    {},
    { ownerRequests: { data: { memberships: [], failedProjects: [project] } } },
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /Study companion/);
  assert.doesNotMatch(html, /No requests to review/);
});

const candidateRoles = [
  { id: "design", title: "Designer", requiredSkills: [], filled: false },
  { id: "dev", title: "Developer", requiredSkills: [], filled: false },
];
const suggestions = {
  projectId: "p1",
  projectTitle: project.title,
  openSeats: 2,
  poolSize: 2,
  suggestions: candidateRoles.map((role, index) => ({
    roleId: role.id,
    roleTitle: role.title,
    requiredSkills: [],
    candidates: [
      {
        userId: `new-${index}`,
        name: index === 0 ? "New designer" : "New developer",
        skills: [{ name: "TypeScript" }],
        matchPercentage: 85,
        explanation: {
          summary: "Covers team needs",
          coveredSkills: ["TypeScript"],
          missingSkills: [],
        },
      },
    ],
  })),
};

test("owners can discover and invite non-applicants even when applicant loading fails", () => {
  for (const ownerMemberships of [
    { data: [] },
    { isPending: true },
    { error: new Error("Applicants unavailable") },
  ]) {
    const queries = [];
    const html = render(
      "components/collaboration/project-detail.tsx",
      "ProjectDetail",
      { id: "p1" },
      {
        params: "section=suggestions",
        detail: { data: { ...project, roles: candidateRoles } },
        ownerMemberships,
        suggestions: { data: suggestions },
        onQuery: (query) => queries.push(query),
      },
    );
    assert.match(html, /Recommended candidates/);
    assert.match(html, /even before they apply/);
    assert.match(html, /New designer/);
    assert.match(html, /New developer/);
    assert.match(html, /Invite New designer as Designer/);
    assert.match(html, /href="\/preview\/new-0"/);
    assert.match(html, /Why this match/);
    assert.doesNotMatch(html, /Applicants unavailable/);
    assert.equal(
      queries.find((q) => q.queryKey.includes("suggestions")).enabled,
      true,
    );
  }
});

test("role filtering preserves backend shortlist context", () => {
  const html = render(
    "components/collaboration/recommended-candidates.tsx",
    "RecommendedCandidates",
    {
      project: { ...project, roles: candidateRoles },
      memberships: [],
    },
    { suggestions: { data: suggestions }, tabs: { all: "dev" } },
  );
  assert.match(html, /New developer/);
  assert.doesNotMatch(html, /New designer/);
  assert.match(html, /earlier role’s top pick/);
});

test("no open roles offers editing without making a suggestions request", () => {
  const queries = [];
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectTeamTools",
    { project },
    {
      onQuery: (q) => queries.push(q),
    },
  );
  assert.match(html, /Add an open role/);
  assert.match(html, /href="\/collaborators\/projects\/p1\/edit"/);
  assert.equal(
    queries.find((q) => q.queryKey.includes("suggestions")).enabled,
    false,
  );
});

test("empty recommendation lists and API failures show different recovery actions", () => {
  const props = {
    project: { ...project, roles: candidateRoles },
    memberships: [],
  };
  const empty = render(
    "components/collaboration/recommended-candidates.tsx",
    "RecommendedCandidates",
    props,
    {
      suggestions: {
        data: {
          ...suggestions,
          suggestions: suggestions.suggestions.map((role) => ({
            ...role,
            candidates: [],
          })),
        },
      },
    },
  );
  assert.equal((empty.match(/No recommended candidates yet/g) ?? []).length, 1);
  assert.match(empty, /Edit roles/);
  const failed = render(
    "components/collaboration/recommended-candidates.tsx",
    "RecommendedCandidates",
    props,
    {
      suggestions: { error: new Error("Matching unavailable") },
    },
  );
  assert.match(failed, /role="alert"/);
  assert.match(failed, /Matching unavailable/);
  assert.doesNotMatch(failed, /No recommended candidates yet/);
});

test("recommendations are inaccessible to visitors even via a direct section link", () => {
  const queries = [];
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectDetail",
    { id: "p1" },
    {
      params: "section=suggestions",
      detail: { data: { ...project, isOwner: false, roles: candidateRoles } },
      onQuery: (q) => queries.push(q),
    },
  );
  assert.doesNotMatch(html, /Recommended candidates|Invite to team/);
  assert.ok(!queries.some((q) => q.queryKey.includes("suggestions")));
});

test("owned project cards offer a direct recommendations shortcut", () => {
  const html = render(
    "components/collaboration/project-list.tsx",
    "ProjectList",
    { view: "mine" },
    {
      projects: { data: [project] },
    },
  );
  assert.match(
    html,
    /href="\/collaborators\/projects\/p1\?section=suggestions"/,
  );
  assert.match(html, /Recommended candidates/);
});

const detailProps = {
  project: { ...project, roles: candidateRoles },
  person: suggestions.suggestions[0].candidates[0],
  roleId: "design",
  roleTitle: "Designer",
  onClose() {},
  onInvite() {},
};
test("candidate details show backend profile information and all skill levels", () => {
  const html = render(
    "components/collaboration/candidate-details.tsx",
    "CandidateDetails",
    detailProps,
    {
      candidateProfile: {
        data: {
          id: "new-0",
          name: "Taylor",
          title: "Product designer",
          location: "Kathmandu",
          bio: "Designing learning tools",
          skills: [{ name: "Figma", level: "EXPERT" }],
          experiences: [
            {
              id: "exp",
              title: "Designer",
              company: "Learning Studio",
              currentRole: true,
              description: "Built accessible interfaces",
            },
          ],
          educations: [
            {
              id: "edu",
              institution: "Design School",
              degree: "Bachelor",
              fieldOfStudy: "Design",
            },
          ],
        },
      },
    },
  );
  for (const text of [
    "Taylor",
    "Product designer",
    "Kathmandu",
    "Designing learning tools",
    "Figma",
    "Expert",
    "Learning Studio",
    "Built accessible interfaces",
    "Design School",
    "Matched skills",
    "Invite to team",
  ])
    assert.match(html, new RegExp(text));
  assert.match(html, /target="_blank"/);
});
test("candidate details distinguish missing profile fields from loading and errors", () => {
  const empty = render(
    "components/collaboration/candidate-details.tsx",
    "CandidateDetails",
    detailProps,
    {
      candidateProfile: {
        data: { skills: [], experiences: [], educations: [] },
      },
    },
  );
  assert.match(empty, /No bio added/);
  assert.match(empty, /No skills added/);
  assert.match(empty, /No experience added/);
  assert.match(empty, /No education added/);
  for (const state of [
    { isPending: true },
    { error: new Error("Profile unavailable") },
  ]) {
    const html = render(
      "components/collaboration/candidate-details.tsx",
      "CandidateDetails",
      detailProps,
      { candidateProfile: { data: undefined, ...state } },
    );
    assert.doesNotMatch(html, /No experience added|No education added/);
    assert.match(html, /Covers team needs/);
    assert.match(html, state.error ? /Profile unavailable/ : /Loading/);
  }
});
test("candidate details prevent inviting an existing member or a filled role", () => {
  const pending = render(
    "components/collaboration/candidate-details.tsx",
    "CandidateDetails",
    { ...detailProps, membership: { ...membership, status: "INVITED" } },
  );
  assert.match(pending, /Invitation pending/);
  assert.doesNotMatch(pending, /Invite to team/);
  const filled = render(
    "components/collaboration/candidate-details.tsx",
    "CandidateDetails",
    {
      ...detailProps,
      project: {
        ...project,
        roles: candidateRoles.map((role) => ({ ...role, filled: true })),
      },
    },
  );
  assert.match(filled, /This role is no longer available/);
  assert.match(
    filled,
    /<button[^>]*disabled=""[^>]*aria-label="Invite New designer as Designer"/,
  );
});

test("owner Overview links to recommendations without duplicating the candidate or team sections", () => {
  const { isOwner, ...backendProject } = project;
  void isOwner;
  const data = projectFromDetail({
    project: { ...backendProject, roles: candidateRoles },
    owner: true,
    members: [],
    pendingCount: 0,
    myMembership: null,
  });
  const queries = [];
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectDetail",
    { id: "p1" },
    {
      detail: { data },
      suggestions: { data: suggestions },
      onQuery: ({ queryKey }) => queries.push(queryKey),
    },
  );
  assert.match(html, /Your project/);
  assert.match(html, /Edit project/);
  assert.match(html, /Recommended candidates/);
  assert.doesNotMatch(
    html,
    /New designer|Invite New designer as Designer|aria-label="Project team"/,
  );
  assert.ok(!queries.some((key) => key.includes("suggestions")));
});

test("project descriptions, goals and role descriptions render safe Markdown", () => {
  const html = render(
    "components/collaboration/project-detail.tsx",
    "ProjectDetail",
    { id: "p1" },
    {
      detail: {
        data: {
          ...project,
          description:
            "## What we build\n\nA **learning app**.\n\n[Unsafe](javascript:alert(1))\n\n<script>alert(1)</script>",
          goals: "- Ship a prototype\n- Test with learners",
          roles: [
            {
              id: "designer",
              title: "Designer",
              requiredSkills: [],
              description: "Design **accessible** screens and `components`.",
            },
          ],
        },
      },
    },
  );
  assert.match(html, /<h2>What we build<\/h2>/);
  assert.match(html, /<strong>learning app<\/strong>/);
  assert.match(html, /<li>Ship a prototype<\/li>/);
  assert.match(html, /<strong>accessible<\/strong>/);
  assert.match(html, /<code>components<\/code>/);
  assert.doesNotMatch(html, /<script|href="javascript:/);
});

test("project-card excerpts parse formatting without extra headings or links", () => {
  const html = render(
    "components/collaboration/project-list.tsx",
    "ProjectList",
    { view: "browse" },
    {
      projects: {
        data: [
          {
            ...project,
            description:
              "# Build together\n\nLearn **React** with [our team](https://example.test/team).",
          },
        ],
      },
    },
  );
  assert.match(html, /<strong>React<\/strong>/);
  assert.doesNotMatch(
    html,
    /# Build together|\*\*React\*\*|href="https:\/\/example.test\/team"|<h1/,
  );
});

test("project create and edit forms expose labeled Markdown fields and retain existing content", () => {
  const html = render(
    "components/collaboration/project-form.tsx",
    "ProjectForm",
    {
      project: {
        ...project,
        description: "## Existing description",
        goals: "- Existing goal",
        roles: [
          {
            id: "designer",
            title: "Designer",
            description: "**Role requirements**",
            requiredSkills: [],
          },
        ],
      },
    },
  );
  assert.match(html, /aria-label="Project description"/);
  assert.match(html, /aria-label="Project goals"/);
  assert.match(html, /aria-label="Role 1 description"/);
  assert.match(html, /## Existing description/);
  assert.match(html, /\*\*Role requirements\*\*/);
});
