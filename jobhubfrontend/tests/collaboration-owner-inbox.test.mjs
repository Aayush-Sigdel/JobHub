import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(
    new URL("../lib/hooks/use-collaboration.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
function setup(projects, getMemberships, isSuccess = true) {
  const exports = {};
  let request;
  new Function("require", "exports", source)((id) => {
    if (id === "next-auth/react")
      return {
        useSession: () => ({
          status: "authenticated",
          data: { user: { id: "owner", name: "Asha" } },
        }),
      };
    if (id === "@tanstack/react-query")
      return {
        useQuery: (options) => {
          if (options.queryKey.includes("projects"))
            return { data: projects, isSuccess };
          request = options;
          return {};
        },
      };
    if (id === "@/lib/actions/collaboration") return { getMemberships };
    throw new Error(`Unexpected import ${id}`);
  }, exports);
  exports.useOwnerMemberships();
  return request;
}

test("owner requests retain successful projects when another project fails", async () => {
  const projects = [
    { id: "ok", title: "Study app" },
    { id: "failed", title: "Design kit" },
  ];
  const options = setup(projects, async (id) =>
    id === "ok"
      ? {
          ok: true,
          data: [
            { id: "request", status: "REQUESTED", projectTitle: "Old name" },
          ],
        }
      : { ok: false, status: 503, message: "Unavailable" },
  );
  const result = await options.queryFn();
  assert.equal(result.memberships.length, 1);
  assert.equal(result.memberships[0].projectTitle, "Study app");
  assert.equal(result.memberships[0].project, projects[0]);
  assert.deepEqual(result.failedProjects, [projects[1]]);
  assert.ok(options.queryKey.includes("owner"));
});

test("no owned projects produces an empty inbox without membership API calls", async () => {
  let calls = 0;
  const options = setup([], async () => {
    calls++;
  });
  assert.equal(options.enabled, true);
  assert.deepEqual(await options.queryFn(), {
    memberships: [],
    failedProjects: [],
  });
  assert.equal(calls, 0);
});

test("owner membership requests wait for the owned project list", () => {
  assert.equal(setup(undefined, () => {}, false).enabled, false);
});
