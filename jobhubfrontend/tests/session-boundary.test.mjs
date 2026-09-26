import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = ts.transpileModule(
  readFileSync(
    new URL("../components/providers/SessionProvider.tsx", import.meta.url),
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
const ownerKey = "jobhub_storage_owner_v1";

async function withBoundary(run) {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  let serverOwner = "alice";
  let sessionAvailable = true;
  let verificationCount = 0;
  let cookieSyncCount = 0;
  globalThis.fetch = async () => {
    verificationCount++;
    return {
      ok: sessionAvailable,
      json: async () => (serverOwner ? { user: { id: serverOwner } } : {}),
    };
  };
  const values = new Map();
  const listeners = new Map();
  let reloads = 0;
  const localStorage = { getItem: (key) => values.get(key) ?? null };
  globalThis.window = {
    localStorage,
    location: { reload: () => reloads++ },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  let session = { data: { user: { id: "alice" } }, status: "authenticated" };
  const slots = [];
  let cursor = 0;
  let effects = [];
  const exports = {};
  new Function("require", "exports", source)((id) => {
    if (id === "react")
      return {
        Fragment: Symbol.for("react.fragment"),
        useState: (initial) => {
          const index = cursor++;
          if (!(index in slots)) slots[index] = initial;
          return [
            slots[index],
            (next) => {
              slots[index] = next;
            },
          ];
        },
        useRef: (initial) => {
          const index = cursor++;
          return (slots[index] ??= { current: initial });
        },
        useEffect: (fn, deps) => {
          const index = cursor++;
          const previous = slots[index];
          if (
            !previous ||
            deps.some((dep, i) => !Object.is(dep, previous.deps[i]))
          ) {
            previous?.cleanup?.();
            effects.push(() => {
              slots[index] = { deps, cleanup: fn() };
            });
          }
        },
      };
    if (id === "next-auth/react")
      return {
        SessionProvider: "NextAuthProvider",
        useSession: () => session,
        getSession: async (options) => {
          assert.equal(options.broadcast, false);
          cookieSyncCount++;
          return session.data;
        },
      };
    if (id === "next/navigation") return { usePathname: () => "/home" };
    if (id === "@/lib/local-session-storage")
      return {
        STORAGE_OWNER_KEY: ownerKey,
        synchronizeLocalSession: (owner) =>
          values.set(ownerKey, owner ? `user:${owner}` : "signed-out"),
      };
    return require(id);
  }, exports);
  const Boundary = exports.SessionProvider({
    children: "app",
    session: session.data,
  }).props.children.type;
  const h = {
    async render(nextSession = session) {
      session = nextSession;
      cursor = 0;
      const result = Boundary({ children: "app" });
      effects.splice(0).forEach((effect) => effect());
      await Promise.resolve();
      return result;
    },
    setOwner: (owner) => values.set(ownerKey, owner),
    setServerOwner: (owner) => {
      serverOwner = owner;
    },
    setSessionAvailable: (available) => {
      sessionAvailable = available;
    },
    flush: () => new Promise((resolve) => setImmediate(resolve)),
    get verificationCount() {
      return verificationCount;
    },
    get cookieSyncCount() {
      return cookieSyncCount;
    },
    storage: (next, extra = {}) =>
      listeners.get("storage")({
        key: ownerKey,
        newValue: next,
        storageArea: localStorage,
        ...extra,
      }),
    restore: () => listeners.get("pageshow")({ persisted: true }),
    showFreshPage: () => listeners.get("pageshow")({ persisted: false }),
    get reloads() {
      return reloads;
    },
  };
  try {
    await h.render();
    await h.render();
    await run(h);
  } finally {
    slots.forEach((slot) => slot?.cleanup?.());
    globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
  }
}

test("refreshing the same signed-in session keeps the page and query provider mounted", async () => {
  await withBoundary(async (h) => {
    const before = await h.render();
    const refreshing = await h.render({
      data: { user: { id: "alice" } },
      status: "loading",
    });
    assert.equal(refreshing.type, before.type);
    assert.equal(refreshing.key, before.key);
    assert.equal(refreshing.props.children, "app");
  });
});

test("same-account and outdated storage events do not reload the page", async () => {
  await withBoundary(async (h) => {
    h.storage("user:alice");
    h.storage("signed-out"); // Queued event superseded by the current account marker.
    h.storage(null);
    h.storage("user:bob", { storageArea: {} });
    await h.flush();
    assert.equal(h.reloads, 0);
  });
});

test("an actual account switch reloads once even when multiple events arrive", async () => {
  await withBoundary(async (h) => {
    h.setOwner("user:bob");
    h.setServerOwner("bob");
    h.storage("user:bob");
    h.storage("user:bob");
    h.restore();
    await h.flush();
    assert.equal(h.reloads, 1);
  });
});

test("restoring the same-account page does not trigger a reload", async () => {
  await withBoundary(async (h) => {
    h.restore();
    await h.flush();
    assert.equal(h.reloads, 0);
    h.setOwner("signed-out");
    h.setServerOwner(null);
    h.restore();
    await h.flush();
    assert.equal(h.reloads, 1);
  });
});

test("sign-out and account switching still hide private state until cleanup finishes", async () => {
  await withBoundary(async (h) => {
    const switching = await h.render({
      data: { user: { id: "bob" } },
      status: "authenticated",
    });
    assert.equal(switching.props.role, "status");
    const ready = await h.render();
    assert.equal(ready.key, "bob");
    assert.equal(ready.props.children, "app");
    const signingOut = await h.render({
      data: null,
      status: "unauthenticated",
    });
    assert.equal(signingOut.props.role, "status");
    assert.equal((await h.render()).key, "anonymous");
  });
});

test("another tab signing out reloads this page once", async () => {
  await withBoundary(async (h) => {
    h.setOwner("signed-out");
    h.setServerOwner(null);
    h.storage("signed-out");
    h.storage("signed-out");
    await h.flush();
    assert.equal(h.reloads, 1);
  });
});

test("a stale tab cannot reload a freshly initialized page for the same signed-in account", async () => {
  await withBoundary(async (h) => {
    // Unlike an outdated queued event, this marker is current, but the cookie
    // still belongs to Alice. The previous implementation reloaded every time.
    for (const marker of ["signed-out", "user:old-account", "signed-out"]) {
      h.setOwner(marker);
      h.storage(marker);
      await h.flush();
    }
    assert.equal(h.reloads, 0);
    assert.equal(h.verificationCount, 3);
    assert.equal(h.cookieSyncCount, 1);
  });
});

test("an unavailable session endpoint never becomes a sign-out reload", async () => {
  await withBoundary(async (h) => {
    h.setServerOwner(null);
    h.setSessionAvailable(false);
    h.setOwner("signed-out");
    h.storage("signed-out");
    await h.flush();
    assert.equal(h.reloads, 0);
    h.setSessionAvailable(true);
    h.storage("signed-out");
    await h.flush();
    assert.equal(h.reloads, 1);
  });
});

test("normal hard-refresh pageshow events never request a reload", async () => {
  await withBoundary(async (h) => {
    h.setOwner("user:old-account");
    h.showFreshPage();
    await h.flush();
    assert.equal(h.reloads, 0);
    assert.equal(h.verificationCount, 0);
  });
});
