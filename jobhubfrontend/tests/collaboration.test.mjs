import test from "node:test";
import assert from "node:assert/strict";
import { apiErrorMessage, isRoleFilled, membershipActions, unreadMembershipCount, validateProject } from "../lib/collaboration.ts";

test("only the receiving party can accept a pending membership", () => {
  const invited = { status: "INVITED", initiatedBy: "OWNER" };
  const requested = { status: "REQUESTED", initiatedBy: "CANDIDATE" };
  assert.deepEqual(membershipActions(invited, true), [{ action: "DECLINE", label: "Withdraw" }]);
  assert.deepEqual(membershipActions(invited, false).map(item => item.action), ["ACCEPT", "DECLINE"]);
  assert.deepEqual(membershipActions(requested, false), [{ action: "DECLINE", label: "Withdraw" }]);
  assert.deepEqual(membershipActions(requested, true).map(item => item.action), ["ACCEPT", "DECLINE"]);
});

test("owners cannot remove active members and terminal memberships have no actions", () => {
  for (const initiatedBy of ["OWNER", "CANDIDATE"]) {
    assert.deepEqual(membershipActions({ status: "ACTIVE", initiatedBy }, true), []);
    assert.deepEqual(membershipActions({ status: "ACTIVE", initiatedBy }, false), [{ action: "LEAVE", label: "Leave project" }]);
    for (const status of ["DECLINED", "LEFT"]) {
      assert.deepEqual(membershipActions({ status, initiatedBy }, true), []);
      assert.deepEqual(membershipActions({ status, initiatedBy }, false), []);
    }
  }
});

const input = {
  title: "Accessible learning app", description: "Build a study companion", teamSize: 3,
  workplaceType: "REMOTE", commitmentHoursPerWeek: 10,
  roles: [{ id: "design", title: "Designer", requiredSkills: [{ name: "Figma", minLevel: "INTERMEDIATE" }] }, { id: "mobile", title: "Mobile developer", requiredSkills: [] }],
};

test("the owner occupies a seat and forms reject invalid role counts", () => {
  assert.equal(validateProject(input), null);
  assert.match(validateProject({ ...input, teamSize: 2 }), /no more roles/);
  assert.match(validateProject({ ...input, roles: [] }), /at least one role/);
  assert.match(validateProject({ ...input, teamSize: 2.5 }), /at least two people/);
  assert.match(validateProject({ ...input, roles: [{ title: "  ", requiredSkills: [] }] }), /title/);
  assert.match(validateProject({ ...input, commitmentHoursPerWeek: -1 }), /greater than zero/);
});

test("editing retains filled role IDs and cannot shrink below the active team", () => {
  const original = { ...input, activeMemberCount: 3, members: [{ userId: "member", roleId: "design" }] };
  assert.equal(isRoleFilled(original.roles[0], original), true);
  assert.match(validateProject({ ...input, roles: [input.roles[1]] }, original), /Filled roles/);
  assert.match(validateProject({ ...input, teamSize: 2, roles: [input.roles[0]] }, original), /smaller than the current team/);
  assert.equal(validateProject(input, original), null);
});

test("silent declines are unread updates while pending invitations stay actionable", () => {
  const seen = "2026-09-19T10:00:00Z";
  const before = "2026-09-18T10:00:00Z";
  const after = "2026-09-20T10:00:00Z";
  const memberships = [
    { status: "INVITED", initiatedBy: "OWNER", updatedAt: before },
    { status: "DECLINED", initiatedBy: "CANDIDATE", updatedAt: after },
    { status: "DECLINED", initiatedBy: "CANDIDATE", updatedAt: before },
    { status: "ACTIVE", initiatedBy: "CANDIDATE", updatedAt: after },
    { status: "REQUESTED", initiatedBy: "CANDIDATE", updatedAt: after },
  ];
  assert.equal(unreadMembershipCount(memberships, seen), 3);
  assert.equal(unreadMembershipCount(memberships, "2026-09-21T10:00:00Z"), 1);
  assert.equal(unreadMembershipCount([], null), 0);
});

test("standard API error messages are shown directly without exposing HTML error pages", () => {
  assert.equal(apiErrorMessage('{"status":409,"message":"This project is full (3 seats)"}', "Retry"), "This project is full (3 seats)");
  assert.equal(apiErrorMessage("<html>Proxy error</html>", "Retry"), "Retry");
  assert.equal(apiErrorMessage("Service unavailable", "Retry"), "Service unavailable");
});
