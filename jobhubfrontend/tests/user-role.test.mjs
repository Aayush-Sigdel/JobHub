import test from "node:test";
import assert from "node:assert/strict";
import { resolveEmployerRole } from "../lib/user-role.ts";

test("live profile role wins when it is available", () => {
  assert.equal(resolveEmployerRole({ employer: true }, { employer: false }), true);
  assert.equal(resolveEmployerRole({ employer: false }, { employer: true }), false);
});

test("session role prevents recruiter UI from becoming applicant UI during profile failures", () => {
  assert.equal(resolveEmployerRole(null, { employer: true }), true);
  assert.equal(resolveEmployerRole(undefined, { employer: false }), false);
});

test("missing role data safely defaults to applicant", () => {
  assert.equal(resolveEmployerRole(null, null), false);
});
