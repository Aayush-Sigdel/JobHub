import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import * as collaboration from "../lib/collaboration.ts";

const require = createRequire(import.meta.url);
const source = ts.transpileModule(
  readFileSync(
    new URL(
      "../components/collaboration/recommended-candidates.tsx",
      import.meta.url,
    ),
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
).outputText;
const person = {
  userId: "new-person",
  name: "Taylor",
  skills: [],
  matchPercentage: 80,
  explanation: { coveredSkills: [], missingSkills: [], summary: "Role fit" },
};
const project = {
  id: "project",
  title: "Study app",
  isOwner: true,
  status: "RECRUITING",
  activeMemberCount: 1,
  teamSize: 3,
  roles: [
    { id: "design", title: "Designer", filled: false, requiredSkills: [] },
  ],
};
class CollaborationError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function harness() {
  const state = [];
  let cursor = 0;
  let query;
  let refreshes = 0;
  let response = { ok: true, data: {} };
  const calls = [];
  const exports = {};
  new Function("require", "exports", source)((id) => {
    if (id === "react")
      return {
        useId: () => "recommendation-filters",
        useState: (initial) => {
          const index = cursor++;
          if (!(index in state)) state[index] = initial;
          return [
            state[index],
            (value) => {
              state[index] = value;
            },
          ];
        },
      };
    if (id === "@tanstack/react-query")
      return {
        useQuery: (options) => {
          query = options;
          return {
            data: {
              suggestions: [
                {
                  roleId: "design",
                  roleTitle: "Designer",
                  requiredSkills: [],
                  candidates: [person],
                },
              ],
            },
            refetch() {},
          };
        },
      };
    if (id === "@/lib/hooks/use-collaboration")
      return {
        CollaborationError,
        useCollaborationIdentity: () => ({ userId: "owner", enabled: true }),
        useRefreshCollaboration: () => async () => {
          refreshes++;
        },
        unwrap: async (result) => {
          const value = await result;
          if (!value.ok)
            throw new CollaborationError(value.status, value.message);
          return value.data;
        },
      };
    if (id === "@/lib/collaboration") return collaboration;
    if (id === "@/lib/actions/collaboration")
      return {
        inviteMember: async (...args) => {
          calls.push(args);
          return response;
        },
        getSuggestions: async (...args) => {
          calls.push(args);
          return { ok: true, data: {} };
        },
      };
    if (id === "sonner") return { toast: { success() {} } };
    if (id === "next/link") return "Link";
    if (id === "./candidate-details")
      return { CandidateDetails: "CandidateDetails" };
    if (
      id === "./shared" ||
      id === "./candidate-ui" ||
      id.startsWith("@/components/ui/")
    )
      return new Proxy(
        {},
        { get: (_, key) => (key === "label" ? (s) => s : key) },
      );
    return require(id);
  }, exports);
  return {
    render(nextProject = project, memberships = []) {
      cursor = 0;
      return exports.RecommendedCandidates({
        project: nextProject,
        memberships,
      });
    },
    get query() {
      return query;
    },
    get refreshes() {
      return refreshes;
    },
    set response(value) {
      response = value;
    },
    calls,
  };
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}
function inviteDialog(h, nextProject, memberships) {
  const tree = h.render();
  nodes(tree)
    .find((node) => node.props?.["aria-label"] === "Invite Taylor as Designer")
    .props.onClick();
  return nodes(h.render(nextProject, memberships)).find(
    (node) => node.type === "MessageDialog",
  );
}

test("inviting a non-applicant sends their user ID, selected role and message then refreshes", async () => {
  const h = harness();
  const dialog = inviteDialog(h);
  assert.equal(dialog.props.description, "Study app · Designer");
  await dialog.props.onSubmit("We would love your help");
  assert.deepEqual(h.calls, [
    ["project", "new-person", "design", "We would love your help"],
  ]);
  assert.equal(h.refreshes, 1);
});

test("invitation checks current role, capacity, status and existing membership before sending", async () => {
  for (const [nextProject, memberships, error] of [
    [
      { ...project, roles: [{ ...project.roles[0], filled: true }] },
      [],
      /role is no longer available/,
    ],
    [{ ...project, activeMemberCount: 3 }, [], /team is full/],
    [{ ...project, status: "COMPLETED" }, [], /Recruitment is closed/],
    [
      project,
      [{ userId: person.userId, status: "INVITED" }],
      /already has a request/,
    ],
  ]) {
    const h = harness();
    // Keep another open role so the recommendations view stays mounted after this role fills.
    const updated = {
      ...nextProject,
      roles: [
        ...nextProject.roles,
        { id: "dev", title: "Developer", filled: false, requiredSkills: [] },
      ],
    };
    const dialog = inviteDialog(h, updated, memberships);
    await assert.rejects(dialog.props.onSubmit(""), error);
    assert.deepEqual(h.calls, []);
    assert.equal(h.refreshes, 1);
  }
});

test("server conflicts remain visible to the invitation dialog and refresh stale recommendations", async () => {
  const h = harness();
  h.response = {
    ok: false,
    status: 409,
    message: "This person already joined",
  };
  await assert.rejects(inviteDialog(h).props.onSubmit(""), /already joined/);
  assert.equal(h.refreshes, 1);
});

test("location filtering applies trimmed input and clears back to anywhere", async () => {
  const h = harness();
  let tree = h.render();
  nodes(tree)
    .find((node) => node.type === "Input")
    .props.onChange({ target: { value: " Kathmandu " } });
  tree = h.render();
  nodes(tree)
    .find((node) => node.type === "form")
    .props.onSubmit({ preventDefault() {} });
  tree = h.render();
  await h.query.queryFn();
  assert.deepEqual(h.calls[0], [
    "project",
    { location: "Kathmandu", poolSize: 200, shortlistSize: 10 },
  ]);
  nodes(tree)
    .find(
      (node) =>
        node.type === "Button" &&
        node.props["aria-label"] === "Clear location filter: Kathmandu",
    )
    .props.onClick();
  h.render();
  await h.query.queryFn();
  assert.equal(h.calls[1][1].location, "");
});

test("candidate details keep the selected role when opening the invitation dialog", async () => {
  const h = harness();
  nodes(h.render())
    .find((node) => node.props?.["aria-label"] === "View details for Taylor")
    .props.onClick();
  const detail = nodes(h.render()).find(
    (node) => node.type === "CandidateDetails",
  );
  assert.equal(detail.props.person.userId, "new-person");
  assert.equal(detail.props.roleId, "design");
  detail.props.onInvite();
  const tree = nodes(h.render());
  assert.ok(!tree.some((node) => node.type === "CandidateDetails"));
  await tree
    .find((node) => node.type === "MessageDialog")
    .props.onSubmit("Welcome");
  assert.deepEqual(h.calls, [["project", "new-person", "design", "Welcome"]]);
});
