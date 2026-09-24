import test from "node:test";
import assert from "node:assert/strict";
import {
  apiErrorMessage,
  isRoleFilled,
  membershipActions,
  membershipFromResponse,
  projectFromDetail,
  projectFromSuggestion,
  projectPayload,
  suggestionParams,
  unreadMembershipCount,
  validateProject,
  projectTeam,
  membershipAcceptanceIssue,
} from "../lib/collaboration.ts";

test("only the receiving party can accept a pending membership", () => {
  const invited = { status: "INVITED", initiatedBy: "OWNER" };
  const requested = { status: "REQUESTED", initiatedBy: "CANDIDATE" };
  assert.deepEqual(membershipActions(invited, true), [
    { action: "DECLINE", label: "Withdraw" },
  ]);
  assert.deepEqual(
    membershipActions(invited, false).map((item) => item.action),
    ["ACCEPT", "DECLINE"],
  );
  assert.deepEqual(membershipActions(requested, false), [
    { action: "DECLINE", label: "Withdraw" },
  ]);
  assert.deepEqual(
    membershipActions(requested, true).map((item) => item.action),
    ["ACCEPT", "DECLINE"],
  );
});

test("owners cannot remove active members and terminal memberships have no actions", () => {
  for (const initiatedBy of ["OWNER", "CANDIDATE"]) {
    assert.deepEqual(
      membershipActions({ status: "ACTIVE", initiatedBy }, true),
      [],
    );
    assert.deepEqual(
      membershipActions({ status: "ACTIVE", initiatedBy }, false),
      [{ action: "LEAVE", label: "Leave project" }],
    );
    for (const status of ["DECLINED", "LEFT"]) {
      assert.deepEqual(membershipActions({ status, initiatedBy }, true), []);
      assert.deepEqual(membershipActions({ status, initiatedBy }, false), []);
    }
  }
});

const input = {
  title: "Accessible learning app",
  description: "Build a study companion",
  teamSize: 3,
  workplaceType: "REMOTE",
  commitmentHoursPerWeek: 10,
  roles: [
    {
      id: "design",
      title: "Designer",
      requiredSkills: [{ name: "Figma", minLevel: "INTERMEDIATE" }],
    },
    { id: "mobile", title: "Mobile developer", requiredSkills: [] },
  ],
};

test("project details expose nested project fields and preserve viewer metadata", () => {
  const project = {
    ...input,
    id: "project-1",
    status: "RECRUITING",
    ownerId: "owner",
    activeMemberCount: 2,
  };
  const members = [{ userId: "member", name: "Designer", roleId: "design" }];
  const myMembership = {
    id: "membership-1",
    projectId: project.id,
    projectTitle: project.title,
    memberId: "member",
    memberName: "Designer",
    status: "ACTIVE",
    initiatedBy: "CANDIDATE",
    roleId: "design",
    roleTitle: "Designer",
    memberImageUrl: null,
    message: null,
    updatedAt: "2026-09-21T10:00:00Z",
    createdAt: null,
  };
  const detail = {
    project,
    members,
    pendingCount: 1,
    myMembership,
    isOwner: false,
  };
  const result = projectFromDetail(detail);

  assert.deepEqual(result, {
    ...project,
    members,
    pendingCount: 1,
    myMembership: membershipFromResponse(myMembership),
    isOwner: false,
  });
  assert.equal(result.myMembership.userId, "member");
  assert.equal(result.myMembership.name, "Designer");
  assert.deepEqual(
    result.roles
      .filter((role) => !isRoleFilled(role, result))
      .map((role) => role.id),
    ["mobile"],
  );
  assert.equal(
    projectFromDetail({ ...detail, isOwner: true, myMembership: null }).isOwner,
    true,
  );
  assert.deepEqual(
    projectFromDetail({ ...detail, project: { ...project, roles: [] } }).roles,
    [],
  );
  assert.equal(detail.project, project);
  assert.equal(project.members, undefined);
});

test("the owner occupies a seat and forms reject invalid role counts", () => {
  assert.equal(validateProject(input), null);
  assert.match(validateProject({ ...input, teamSize: 2 }), /no more roles/);
  assert.match(validateProject({ ...input, roles: [] }), /at least one role/);
  assert.match(
    validateProject({ ...input, teamSize: 2.5 }),
    /at least two people/,
  );
  assert.match(
    validateProject({ ...input, roles: [{ title: "  ", requiredSkills: [] }] }),
    /title/,
  );
  assert.match(
    validateProject({ ...input, commitmentHoursPerWeek: -1 }),
    /greater than zero/,
  );
});

test("editing retains filled role titles and cannot shrink below the active team", () => {
  const original = {
    ...input,
    activeMemberCount: 3,
    members: [{ userId: "member", roleId: "design" }],
  };
  assert.equal(isRoleFilled(original.roles[0], original), true);
  assert.match(
    validateProject({ ...input, roles: [input.roles[1]] }, original),
    /Filled roles/,
  );
  assert.match(
    validateProject(
      { ...input, teamSize: 2, roles: [input.roles[0]] },
      original,
    ),
    /smaller than the current team/,
  );
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
  assert.equal(
    apiErrorMessage(
      '{"status":409,"message":"This project is full (3 seats)"}',
      "Retry",
    ),
    "This project is full (3 seats)",
  );
  assert.equal(apiErrorMessage("<html>Proxy error</html>", "Retry"), "Retry");
  assert.equal(
    apiErrorMessage("Service unavailable", "Retry"),
    "Service unavailable",
  );
});

test("recommended projects retain their roles and match explanations", () => {
  const explanation = {
    summary: "Your design skills fill a gap",
    coveredSkills: ["Figma"],
    missingSkills: [],
    gapFitPercentage: 90,
    skillCoveragePercentage: 100,
    teamOverlapPercentage: 10,
  };
  const result = projectFromSuggestion({
    project: { ...input, id: "project-1", status: "RECRUITING" },
    bestRoleId: "design",
    bestRoleTitle: "Designer",
    matchPercentage: 90,
    explanation,
  });
  assert.equal(result.id, "project-1");
  assert.equal(result.status, "RECRUITING");
  assert.equal(result.roles[0].id, result.bestRoleId);
  assert.equal(result.matchPercentage, 90);
  assert.deepEqual(result.explanation, explanation);
});

test("membership wire fields supply profile links, names and nullable display values", () => {
  const result = membershipFromResponse({
    id: "m1",
    projectId: "p1",
    projectTitle: "Project",
    memberId: "person",
    memberName: "Taylor",
    memberImageUrl: null,
    roleId: null,
    roleTitle: null,
    message: null,
    status: "INVITED",
    initiatedBy: "OWNER",
    updatedAt: null,
    createdAt: "2026-09-21T10:00:00Z",
  });
  assert.equal(result.userId, "person");
  assert.equal(result.name, "Taylor");
  assert.equal(result.roleId, undefined);
  assert.equal(result.imageUrl, undefined);
  assert.equal(result.updatedAt, "2026-09-21T10:00:00Z");
  assert.deepEqual(
    membershipActions(result, false).map((item) => item.action),
    ["ACCEPT", "DECLINE"],
  );
});

test("project updates clear optional fields using the backend removal flags", () => {
  const payload = projectPayload(
    {
      ...input,
      goals: "",
      location: "  ",
      commitmentHoursPerWeek: undefined,
      durationWeeks: undefined,
    },
    true,
  );
  for (const field of [
    "removeGoals",
    "removeLocation",
    "removeCommitment",
    "removeDuration",
  ])
    assert.equal(payload[field], true);
  assert.equal("id" in payload.roles[0], false);
  assert.deepEqual(
    payload.roles[0].requiredSkills,
    input.roles[0].requiredSkills,
  );
  const populated = projectPayload(
    { ...input, goals: "Ship", location: "Remote", durationWeeks: 8 },
    true,
  );
  for (const field of [
    "removeGoals",
    "removeLocation",
    "removeCommitment",
    "removeDuration",
  ])
    assert.equal(populated[field], false);
  assert.equal("removeGoals" in projectPayload(input, false), false);
});

test("candidate search sends supported filters and respects backend limits", () => {
  assert.equal(suggestionParams({}).toString(), "");
  assert.deepEqual(
    Object.fromEntries(
      suggestionParams({
        location: " Kathmandu ",
        poolSize: 200,
        shortlistSize: 10,
      }),
    ),
    { location: "Kathmandu", poolSize: "200", shortlistSize: "10" },
  );
  assert.deepEqual(
    Object.fromEntries(suggestionParams({ poolSize: 999, shortlistSize: 0 })),
    { poolSize: "500", shortlistSize: "1" },
  );
  assert.equal(
    suggestionParams({ poolSize: NaN, shortlistSize: Infinity }).toString(),
    "",
  );
});

test("form validation matches numeric limits and title-based filled role retention", () => {
  assert.match(validateProject({ ...input, teamSize: 21 }), /at most 20/);
  for (const hours of [0, 1.5, 81])
    assert.match(
      validateProject({ ...input, commitmentHoursPerWeek: hours }),
      /Weekly commitment/,
    );
  for (const weeks of [0, -1, 1.5])
    assert.match(
      validateProject({ ...input, durationWeeks: weeks }),
      /Duration/,
    );
  assert.equal(
    validateProject({ ...input, commitmentHoursPerWeek: 80, durationWeeks: 1 }),
    null,
  );
  assert.match(
    validateProject({
      ...input,
      roles: [input.roles[0], { ...input.roles[1], title: " designer " }],
    }),
    /unique title/,
  );
  const original = {
    ...input,
    activeMemberCount: 2,
    roles: [{ ...input.roles[0], filled: true }, input.roles[1]],
  };
  assert.match(
    validateProject(
      {
        ...input,
        roles: [{ ...input.roles[0], title: "Renamed" }, input.roles[1]],
      },
      original,
    ),
    /same title/,
  );
  assert.equal(
    validateProject(
      {
        ...input,
        roles: [{ ...input.roles[0], title: " designer " }, input.roles[1]],
      },
      original,
    ),
    null,
  );
});

test("the backend's owner and memberships form a deduplicated team", () => {
  const project = {
    ...input,
    ownerId: "owner",
    ownerName: "Asha",
    members: [
      { userId: "member", name: "Rita", roleId: "design" },
      { userId: "owner", name: "Asha" },
      { userId: "member", name: "Rita" },
    ],
  };
  const team = projectTeam(project);
  assert.deepEqual(
    team.map(({ userId }) => userId),
    ["owner", "member"],
  );
  assert.equal(team[0].name, "Asha");
  assert.equal(team[0].roleTitle, "Owner");
  assert.equal(team[1].roleId, "design");
  assert.equal(project.members.length, 3);
});

test("owner names fall back to session only for the actual owner", () => {
  const project = {
    ...input,
    ownerId: "owner",
    ownerName: "  ",
    owner: { userId: "owner", name: "" },
    members: [],
  };
  assert.equal(
    projectTeam(project, { userId: "owner", userName: "Asha" })[0].name,
    "Asha",
  );
  assert.equal(
    projectTeam(project, { userId: "visitor", userName: "Rita" })[0].name,
    "Project owner",
  );
  assert.equal(
    projectTeam(
      { ...project, ownerName: "Backend name" },
      { userId: "owner", userName: "Old name" },
    )[0].name,
    "Backend name",
  );
});

test("acceptance reports closed recruitment, full teams, and occupied or removed roles", () => {
  const project = { ...input, activeMemberCount: 1, status: "RECRUITING" };
  assert.equal(
    membershipAcceptanceIssue(project, { roleId: "design" }),
    undefined,
  );
  assert.match(
    membershipAcceptanceIssue({ ...project, status: "COMPLETED" }, {}),
    /closed/,
  );
  assert.match(
    membershipAcceptanceIssue({ ...project, activeMemberCount: 3 }, {}),
    /full/,
  );
  assert.match(
    membershipAcceptanceIssue(project, { roleId: "removed" }),
    /no longer/,
  );
  assert.match(
    membershipAcceptanceIssue(
      { ...project, roles: [{ ...input.roles[0], filled: true }] },
      { roleId: "design" },
    ),
    /no longer/,
  );
});
