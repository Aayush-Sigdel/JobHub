import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import * as collaboration from "../lib/collaboration.ts";

const require = createRequire(import.meta.url);
const source = ts.transpileModule(
  readFileSync(
    new URL("../components/collaboration/project-form.tsx", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
).outputText;
const input = {
  title: " Study app ",
  description: " ## Learn together\n\nBuild **accessible** tools. ",
  goals: " - Ship a prototype ",
  teamSize: 3,
  workplaceType: "REMOTE",
  roles: [
    {
      title: " Designer ",
      requiredSkills: [{ name: " Figma ", minLevel: "EXPERT" }],
    },
  ],
};
class CollaborationError extends Error {}
async function submit({ editing = false, fail = false } = {}) {
  const routes = [];
  const calls = [];
  let refreshed = false;
  const exports = {};
  new Function("require", "exports", source)((id) => {
    if (id === "react")
      return {
        useState: (initial) => [
          typeof initial === "function" ? input : initial,
          () => {},
        ],
      };
    if (id === "next/navigation")
      return {
        useRouter: () => ({
          push: (url) => {
            assert.ok(refreshed);
            routes.push(url);
          },
        }),
      };
    if (id === "next/link") return "Link";
    if (id === "@/components/post-job/MarkdownEditor") return "MarkdownEditor";
    if (id === "@/lib/collaboration") return collaboration;
    if (id === "@/lib/hooks/use-collaboration")
      return {
        CollaborationError,
        unwrap: async (value) => value,
        useRefreshCollaboration: () => async () => {
          refreshed = true;
        },
      };
    if (id === "@/lib/actions/collaboration")
      return {
        saveProject: async (...args) => {
          calls.push(args);
          if (fail) throw new Error("Matching unavailable");
          return { id: "created-project" };
        },
      };
    if (id === "./shared" || id.startsWith("@/components/ui/"))
      return new Proxy(
        {},
        { get: (_, key) => (key === "label" ? (s) => s : key) },
      );
    return require(id);
  }, exports);
  const tree = exports.ProjectForm({
    project: editing
      ? { ...input, id: "created-project", activeMemberCount: 1, roles: [] }
      : undefined,
  });
  const form = tree.props.children.find((child) => child?.type === "form");
  await form.props.onSubmit({ preventDefault() {} });
  return { routes, calls };
}

test("posting saves role requirements and opens recommended candidates immediately", async () => {
  const { routes, calls } = await submit();
  assert.deepEqual(routes, [
    "/collaborators/projects/created-project?section=suggestions",
  ]);
  assert.equal(calls[0][0].title, "Study app");
  assert.equal(
    calls[0][0].description,
    "## Learn together\n\nBuild **accessible** tools.",
  );
  assert.equal(calls[0][0].goals, "- Ship a prototype");
  assert.equal(calls[0][0].roles[0].title, "Designer");
  assert.equal(calls[0][0].roles[0].requiredSkills[0].name, "Figma");
});
test("editing a project keeps the ordinary project destination", async () => {
  assert.deepEqual((await submit({ editing: true })).routes, [
    "/collaborators/projects/created-project",
  ]);
});
test("failed creation never navigates to a nonexistent recommendation page", async () => {
  assert.deepEqual((await submit({ fail: true })).routes, []);
});
