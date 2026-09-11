import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(
  new URL("../lib/tab-switch-tracker.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const { startTabSwitchTracker, FOCUS_SWITCH_DELAY_MS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const flush = () => new Promise((resolve) => setImmediate(resolve));
const settleBlur = () =>
  new Promise((resolve) => setTimeout(resolve, FOCUS_SWITCH_DELAY_MS + 20));
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function setup({ hidden = false, initialCount = 0, record } = {}) {
  const page = new EventTarget();
  const browser = new EventTarget();
  page.hidden = hidden;
  let focused = !hidden;
  page.hasFocus = () => focused;
  const snapshots = [],
    requests = [],
    errors = [];
  const stop = startTabSwitchTracker({
    page,
    browser,
    initialCount,
    record: async (event) => {
      requests.push(event);
      return record ? record(event) : { tabSwitchCount: 60 + requests.length };
    },
    onChange: (snapshot) => snapshots.push(snapshot),
    onError: (error) => errors.push(error),
  });
  return {
    page,
    browser,
    stop,
    snapshots,
    requests,
    errors,
    get count() {
      return snapshots.at(-1)?.tabSwitchCount ?? initialCount;
    },
    visibility(hidden, hasFocus = !hidden) {
      focused = hasFocus;
      page.hidden = hidden;
      page.dispatchEvent(new Event("visibilitychange"));
    },
    blur(hasFocus = false) {
      focused = hasFocus;
      browser.dispatchEvent(new Event("blur"));
    },
    focus() {
      focused = true;
      browser.dispatchEvent(new Event("focus"));
    },
  };
}

test("first switch stays at one when the server returns a historical total of 60", async () => {
  const t = setup({ record: async () => ({ tabSwitchCount: 60 }) });
  t.blur();
  t.visibility(true);
  t.visibility(true);
  t.visibility(false);
  t.focus();
  t.visibility(false);
  await flush();
  assert.equal(t.count, 1);
  assert.equal(t.requests.length, 1);
  assert.equal(t.requests[0].eventType, "TAB_SWITCH");
  t.stop();
});

test("switching apps while the assessment stays visible counts once, including return", async () => {
  const t = setup();
  t.blur();
  await settleBlur();
  t.blur();
  await settleBlur();
  t.focus();
  await flush();
  assert.equal(t.count, 1);
  assert.equal(t.requests.length, 1);
  assert.equal(t.requests[0].eventType, "WINDOW_BLUR");
  t.stop();
});

test("app blur followed by hidden and return events still counts only once", async () => {
  const t = setup();
  t.blur();
  await settleBlur();
  t.visibility(true);
  t.visibility(false, false);
  t.blur();
  t.focus();
  await flush();
  assert.equal(t.count, 1);
  assert.equal(t.requests.length, 1);
  t.stop();
});

test("becoming visible without focus does not rearm the same absence", async () => {
  const t = setup();
  t.visibility(true);
  t.visibility(false, false);
  t.blur();
  await settleBlur();
  assert.equal(t.count, 1);
  t.focus();
  t.blur();
  await settleBlur();
  assert.equal(t.count, 2);
  t.stop();
});

test("right-click and native-menu focus loss do not count or block the menu", async () => {
  const t = setup();
  t.blur();
  const menu = new Event("contextmenu", { cancelable: true });
  t.page.dispatchEvent(menu);
  t.blur();
  await settleBlur();
  assert.equal(menu.defaultPrevented, false);
  assert.equal(t.count, 0);
  t.focus();
  t.blur();
  await settleBlur();
  assert.equal(t.count, 1);
  t.stop();
});

test("a tab switch with a context menu open is still counted", async () => {
  const t = setup();
  t.page.dispatchEvent(new Event("contextmenu"));
  t.visibility(true);
  t.visibility(false);
  await flush();
  assert.equal(t.count, 1);
  t.stop();
});

test("clipboard shortcuts, iframe/editor focus and transient blur do not count", async () => {
  const t = setup();
  for (let i = 0; i < 22; i++) {
    const event = new Event("keydown", { cancelable: true });
    Object.assign(event, { ctrlKey: true, key: "v" });
    t.page.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
    t.blur();
    t.focus();
  }
  t.blur(true);
  await settleBlur();
  assert.equal(t.count, 0);
  assert.equal(t.requests.length, 0);
  t.stop();
});

test("mounting hidden and returning does not invent a departure", async () => {
  const t = setup({ hidden: true });
  t.visibility(true);
  t.visibility(false);
  t.focus();
  await flush();
  assert.equal(t.count, 0);
  t.visibility(true);
  await flush();
  assert.equal(t.count, 1);
  t.stop();
});

test("resuming preserves this assignment count without importing the server total", async () => {
  const t = setup({ initialCount: 2 });
  assert.equal(t.requests.length, 0);
  t.visibility(true);
  t.visibility(false);
  await flush();
  assert.equal(t.count, 3);
  t.stop();
});

test("slow responses serialize writes without delaying or inflating the display", async () => {
  const firstWrite = deferred();
  let writes = 0;
  const t = setup({
    record: () =>
      ++writes === 1
        ? firstWrite.promise
        : Promise.resolve({ tabSwitchCount: 62 }),
  });
  t.visibility(true);
  t.visibility(false);
  t.visibility(true);
  t.visibility(false);
  await flush();
  assert.equal(t.count, 2);
  assert.equal(writes, 1);
  firstWrite.resolve({ tabSwitchCount: 61 });
  await flush();
  assert.equal(writes, 2);
  assert.equal(t.count, 2);
  t.stop();
});

test("22 actual departures produce exactly 22 requests and counts", async () => {
  const t = setup();
  for (let i = 0; i < 22; i++) {
    t.visibility(true);
    t.visibility(false);
  }
  await flush();
  assert.equal(t.requests.length, 22);
  assert.equal(t.count, 22);
  t.stop();
});

test("lost responses do not retry or inflate later switches", async () => {
  let calls = 0;
  const t = setup({
    record: async () => {
      if (++calls === 1) throw new Error("Response lost");
      return { tabSwitchCount: 62 };
    },
  });
  t.visibility(true);
  t.visibility(false);
  await flush();
  t.visibility(true);
  await flush();
  assert.equal(t.count, 2);
  assert.equal(t.requests.length, 2);
  assert.equal(t.errors.length, 1);
  t.stop();
});

test("cleanup removes listeners and cancels delayed blur", async () => {
  const t = setup();
  t.blur();
  t.stop();
  t.visibility(true);
  t.focus();
  await settleBlur();
  assert.equal(t.requests.length, 0);
  assert.equal(t.snapshots.length, 0);
});

test("cleanup ignores late responses while finishing already observed telemetry", async () => {
  const write = deferred();
  const t = setup({ record: () => write.promise });
  t.visibility(true);
  await flush();
  t.stop();
  const updates = t.snapshots.length;
  write.resolve({ tabSwitchCount: 60 });
  await flush();
  assert.equal(t.requests.length, 1);
  assert.equal(t.snapshots.length, updates);
  assert.equal(t.count, 1);
});

test("effect setup-cleanup-setup leaves only one active listener", async () => {
  const page = new EventTarget(),
    browser = new EventTarget();
  page.hidden = false;
  page.hasFocus = () => true;
  let writes = 0;
  const options = {
    page,
    browser,
    record: async () => ++writes,
    onChange: () => {},
    onError: assert.fail,
  };
  startTabSwitchTracker(options)();
  const stop = startTabSwitchTracker(options);
  page.hidden = true;
  page.dispatchEvent(new Event("visibilitychange"));
  await flush();
  assert.equal(writes, 1);
  stop();
});
