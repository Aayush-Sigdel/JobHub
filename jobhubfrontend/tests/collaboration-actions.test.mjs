import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import * as collaboration from "../lib/collaboration.ts";

class ServiceApiError extends Error {
  constructor(status, detail) { super(detail); this.status = status; this.detail = detail; }
}

const source = ts.transpileModule(readFileSync(new URL("../lib/actions/collaboration.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function actions(fetchWithAuth) {
  const exports = {};
  new Function("require", "exports", source)((id) => {
    if (id === "@/lib/service-api") return { fetchWithAuth, ServiceApiError };
    if (id === "@/lib/collaboration") return collaboration;
    throw new Error(`Unexpected import: ${id}`);
  }, exports);
  return exports;
}
const project = { id: "project-1", title: "Study app", description: "Build together", status: "RECRUITING", workplaceType: "REMOTE", teamSize: 3, activeMemberCount: 1, ownerId: "owner", roles: [{ id: "role-1", title: "Designer", requiredSkills: [] }] };
const membership = { id: "member-1", projectId: project.id, projectTitle: project.title, memberId: "candidate", memberName: "Taylor", memberImageUrl: null, roleId: "role-1", roleTitle: "Designer", status: "INVITED", initiatedBy: "OWNER", message: "Join us", createdAt: "2026-09-21T10:00:00Z", updatedAt: null };

test("project queries adapt the actual detail and recommendation envelopes", async () => {
  const api = actions(async path => {
    if (path.includes("/for-me?")) return [{ project, bestRoleId: "role-1", bestRoleTitle: "Designer", matchPercentage: 90, explanation: { summary: "Good fit" } }];
    if (path === "/collab/projects/project-1") return { project, members: [], isOwner: false, pendingCount: 1, myMembership: membership };
    return [project];
  });
  assert.equal((await api.getProject(project.id)).data.roles[0].title, "Designer");
  assert.equal((await api.getProject(project.id)).data.myMembership.userId, "candidate");
  const recommended = (await api.getProjects("for-me")).data[0];
  assert.equal(recommended.id, project.id);
  assert.equal(recommended.bestRoleId, "role-1");
  assert.equal(recommended.matchPercentage, 90);
  assert.deepEqual((await api.getProjects("mine")).data, [project]);
});

test("people discovery uses project suggestions and supported search parameters", async () => {
  const api = actions(async (path, options) => {
    assert.equal(path, "/collab/projects/project-1/suggestions?location=Kathmandu&poolSize=200&shortlistSize=10");
    assert.equal(options.cache, "no-store");
    return { projectId: project.id, projectTitle: project.title, openSeats: 2, poolSize: 0, suggestions: [], note: "No candidates yet" };
  });
  const result = await api.getSuggestions(project.id, { location: "Kathmandu", poolSize: 200, shortlistSize: 10 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.suggestions, []);
});

test("membership queries and mutations map member fields and send the correct routes and bodies", async () => {
  const calls = [];
  const api = actions(async (path, options) => {
    calls.push([path, options.method, options.body ? JSON.parse(options.body) : undefined]);
    return options.method === "GET" ? [membership] : membership;
  });
  for (const result of [await api.getMemberships(), await api.getMemberships(project.id)]) assert.equal(result.data[0].name, "Taylor");
  assert.equal((await api.inviteMember(project.id, "candidate", undefined, "Join us")).data.userId, "candidate");
  await api.requestMembership(project.id, "role-1", "I can help");
  for (const action of ["ACCEPT", "DECLINE", "LEAVE"]) await api.changeMembership(membership.id, action);
  assert.deepEqual(calls, [
    ["/collab/memberships/mine", "GET", undefined],
    ["/collab/projects/project-1/memberships", "GET", undefined],
    ["/collab/projects/project-1/invite", "POST", { userId: "candidate", message: "Join us" }],
    ["/collab/projects/project-1/request", "POST", { roleId: "role-1", message: "I can help" }],
    ...["ACCEPT", "DECLINE", "LEAVE"].map(action => ["/collab/memberships/member-1", "PATCH", { action }]),
  ]);
});

test("project creation, updates, status changes and deletion use backend contracts", async () => {
  const calls = [];
  const api = actions(async (path, options) => { calls.push([path, options.method, options.body && JSON.parse(options.body)]); return project; });
  const input = { title: project.title, description: project.description, teamSize: 3, workplaceType: "REMOTE", roles: project.roles };
  await api.saveProject(input);
  await api.saveProject(input, project.id);
  await api.changeProjectStatus(project.id, "COMPLETED");
  await api.deleteProject(project.id);
  assert.equal(calls[0][0], "/collab/projects");
  assert.equal(calls[0][1], "POST");
  assert.equal("id" in calls[0][2].roles[0], false);
  assert.equal(calls[1][1], "PUT");
  assert.equal(calls[1][2].removeCommitment, true);
  assert.deepEqual(calls[2], ["/collab/projects/project-1/status", "PATCH", { status: "COMPLETED" }]);
  assert.equal(calls[3][1], "DELETE");
  assert.equal((await api.saveProject({ ...input, teamSize: 21 })).ok, false);
  assert.equal(calls.length, 4);
});

test("authorization, missing matching data and service errors stay visible", async () => {
  for (const status of [401, 403, 404, 409, 503]) {
    const api = actions(async () => { throw new ServiceApiError(status, JSON.stringify({ message: "Request rejected" })); });
    for (const result of [await api.getProject(project.id), await api.getProjects("for-me"), await api.getSuggestions(project.id), await api.getMemberships(), await api.inviteMember(project.id, "candidate", undefined, "")]) {
      assert.deepEqual(result, { ok: false, status, message: "Request rejected" });
    }
  }
});
