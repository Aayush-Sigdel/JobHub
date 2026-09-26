import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { resolveEmployerRole } from "../lib/user-role.ts";

const require = createRequire(import.meta.url);
class Redirect extends Error {}
function load(file, mocks) {
  const source = ts.transpileModule(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  new Function("require", "exports", source)((id) => {
    if (id in mocks) return mocks[id];
    if (id === "react" || id === "react/jsx-runtime") return require(id);
    throw new Error(`Unexpected dependency: ${id}`);
  }, exports);
  return exports;
}

function scenario(cookieEmployer, profileEmployer, sessionEmployer = cookieEmployer) {
  const fetchWithAuth = async (endpoint) => {
    if (endpoint !== "/user/profile") return [];
    if (profileEmployer === undefined) throw new Error("Profile unavailable");
    return { employer: profileEmployer };
  };
  const role = load("lib/server-user-role.ts", {
    react: { cache: (fn) => fn },
    "next-auth": { getServerSession: async () => ({ user: { employer: sessionEmployer } }) },
    "next/navigation": { redirect: (path) => { throw new Redirect(path); } },
    "./auth-option": { authOptions: {} },
    "./service-api": { fetchWithAuth },
    "./user-role": { resolveEmployerRole },
  });
  const common = {
    "@/lib/server-user-role": role,
    "@/lib/service-api": { fetchWithAuth },
    "@/lib/application-load-error": { applicationLoadError: () => ({}) },
  };
  const pages = {
    "/dashboard": load("app/(poster)/layout.tsx", {
      ...common, "@/components/poster-header": { PosterHeader: () => null },
    }).default,
    "/home": load("app/(applier)/home/page.tsx", {
      ...common, "./_components/home-container": { HomeContainer: () => null },
    }).default,
  };
  let authOptions;
  const middleware = load("middleware.ts", {
    "next-auth/middleware": { withAuth: (handler, options) => { authOptions = options; return handler; } },
    "next/server": { NextResponse: {
      next: () => null,
      redirect: (url) => { throw new Redirect(url.pathname); },
    } },
  }).default;
  const token = { user: { employer: cookieEmployer, onboardingCompleted: true } };
  return {
    role, authOptions,
    middleware: (path) => middleware({ nextauth: { token }, nextUrl: { pathname: path }, url: `https://jobhub.test${path}` }),
    async visit(start) {
      const visited = [];
      let path = start;
      for (let i = 0; i < 4; i++) {
        assert.ok(!visited.includes(path), `Redirect loop: ${[...visited, path]}`);
        visited.push(path);
        try {
          this.middleware(path);
          await pages[path]({ children: null });
          return visited;
        } catch (error) {
          if (!(error instanceof Redirect)) throw error;
          path = error.message;
        }
      }
      assert.fail("Too many redirects");
    },
  };
}

for (const [cookie, profile, destination] of [
  [false, true, "/dashboard"], [true, false, "/home"],
  [true, true, "/dashboard"], [false, false, "/home"],
  [true, undefined, "/dashboard"], [false, undefined, "/home"],
]) {
  test(`dashboard/home settle with cookie=${cookie}, profile=${profile}`, async () => {
    for (const start of ["/dashboard", "/home"]) {
      const visited = await scenario(cookie, profile).visit(start);
      assert.equal(visited.at(-1), destination);
      assert.ok(visited.length <= 2);
    }
  });
}

test("a server session with a repaired role does not bounce off the old cookie", async () => {
  assert.deepEqual(await scenario(false, undefined, true).visit("/home"), ["/home", "/dashboard"]);
});

test("role guards still reject the opposite role", async () => {
  for (const employer of [true, false]) {
    const { role } = scenario(!employer, employer);
    await assert.rejects(role.requireUserRole(!employer), (error) =>
      error instanceof Redirect && error.message === (employer ? "/dashboard" : "/home"));
    assert.equal((await role.requireUserRole(employer)).employer, employer);
  }
});

test("middleware still requires authentication and allows shared profile routes", () => {
  const app = scenario(true, true);
  assert.equal(app.authOptions.callbacks.authorized({ token: null }), false);
  assert.equal(app.authOptions.callbacks.authorized({ token: {} }), true);
  assert.equal(app.middleware("/candidate-profile"), null);
});
