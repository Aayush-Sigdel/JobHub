import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

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
          useSearchParams: () => new URLSearchParams(),
          usePathname: () => state.path ?? "/collaborators/explore",
        };
      if (id === "@tanstack/react-query")
        return {
          useQuery: ({ queryKey }) => {
            const kind = queryKey.includes("project-memberships")
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
          useCollaborationIdentity: () => ({ userId: "owner", enabled: true }),
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
    { view: "mine" },
    {
      tabs: { owned: "joined" },
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
      assert.match(html, /Find teammates/);
      assert.doesNotMatch(html, /Delete project|Request to join/);
    } else {
      assert.doesNotMatch(html, /Find teammates|Settings/);
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
      resolve(root, "app/(applier)/collaborators/people/page.tsx"),
      "utf8",
    ),
    /redirect\("\/collaborators\/my-projects"\)/,
  );
});
