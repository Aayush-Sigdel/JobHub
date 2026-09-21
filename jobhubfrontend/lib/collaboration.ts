import type {
  Membership,
  MembershipAction,
  MembershipResponse,
  Project,
  ProjectDetailResponse,
  ProjectInput,
  ProjectRole,
  ProjectSuggestionResponse,
  SuggestionFilters,
} from "../types/api/collaboration.ts";

export function projectFromDetail({
  project,
  myMembership,
  ...detail
}: ProjectDetailResponse): Project {
  return {
    ...project,
    ...detail,
    myMembership: myMembership ? membershipFromResponse(myMembership) : null,
  };
}

export function membershipFromResponse(response: MembershipResponse): Membership {
  return {
    id: response.id,
    projectId: response.projectId,
    projectTitle: response.projectTitle,
    userId: response.memberId,
    name: response.memberName,
    imageUrl: response.memberImageUrl ?? undefined,
    roleId: response.roleId ?? undefined,
    roleTitle: response.roleTitle ?? undefined,
    status: response.status,
    initiatedBy: response.initiatedBy,
    message: response.message ?? undefined,
    updatedAt: response.updatedAt ?? response.createdAt ?? "",
  };
}

export function projectFromSuggestion({ project, bestRoleId, bestRoleTitle, ...match }: ProjectSuggestionResponse): Project {
  return { ...project, ...match, bestRoleId: bestRoleId ?? undefined, bestRoleTitle: bestRoleTitle ?? undefined };
}

export function suggestionParams(filters: SuggestionFilters) {
  const params = new URLSearchParams();
  if (filters.location?.trim()) params.set("location", filters.location.trim());
  if (filters.poolSize != null && Number.isFinite(filters.poolSize))
    params.set("poolSize", String(Math.min(500, Math.max(10, Math.trunc(filters.poolSize)))));
  if (filters.shortlistSize != null && Number.isFinite(filters.shortlistSize))
    params.set("shortlistSize", String(Math.min(25, Math.max(1, Math.trunc(filters.shortlistSize)))));
  return params;
}

export function projectPayload(input: ProjectInput, updating: boolean) {
  return {
    ...input,
    roles: input.roles.map(({ title, description, requiredSkills }) => ({ title, description, requiredSkills })),
    ...(updating ? {
      removeGoals: !input.goals?.trim(),
      removeLocation: !input.location?.trim(),
      removeCommitment: input.commitmentHoursPerWeek == null,
      removeDuration: input.durationWeeks == null,
    } : {}),
  };
}

export function membershipActions(
  membership: Pick<Membership, "status" | "initiatedBy">,
  isOwner: boolean,
): { action: MembershipAction; label: string }[] {
  if (membership.status === "ACTIVE")
    return isOwner ? [] : [{ action: "LEAVE", label: "Leave project" }];
  if (membership.status !== "INVITED" && membership.status !== "REQUESTED")
    return [];
  const canAccept = isOwner
    ? membership.status === "REQUESTED" &&
      membership.initiatedBy === "CANDIDATE"
    : membership.status === "INVITED" && membership.initiatedBy === "OWNER";
  return canAccept
    ? [
        { action: "ACCEPT", label: "Accept" },
        { action: "DECLINE", label: "Decline" },
      ]
    : [{ action: "DECLINE", label: "Withdraw" }];
}

export function isRoleFilled(role: ProjectRole, project: Project) {
  return Boolean(
    role.filled ||
    role.isFilled ||
    project.members?.some((member) => member.roleId === role.id),
  );
}

export function validateProject(
  input: ProjectInput,
  original?: Project,
): string | null {
  if (!input.title.trim() || !input.description.trim())
    return "Add a project title and description.";
  if (!Number.isInteger(input.teamSize) || input.teamSize < 2)
    return "A team needs at least two people, including you.";
  if (input.teamSize > 20) return "A team can have at most 20 people.";
  if (original && input.teamSize < original.activeMemberCount)
    return "Team size cannot be smaller than the current team.";
  if (!input.roles.length || input.roles.length > input.teamSize - 1)
    return "Add at least one role, with no more roles than available seats. You occupy one seat.";
  if (input.roles.some((role) => !role.title.trim()))
    return "Give every role a title.";
  if (new Set(input.roles.map(role => role.title.trim().toLowerCase())).size !== input.roles.length)
    return "Give every role a unique title.";
  if (
    input.roles.some((role) =>
      role.requiredSkills.some((skill) => !skill.name.trim()),
    )
  )
    return "Name each required skill or remove the empty skill.";
  if (
    input.commitmentHoursPerWeek != null &&
    (!Number.isInteger(input.commitmentHoursPerWeek) ||
      input.commitmentHoursPerWeek <= 0 || input.commitmentHoursPerWeek > 80)
  )
    return "Weekly commitment must be a whole number greater than zero and no more than 80 hours.";
  if (input.durationWeeks != null && (!Number.isInteger(input.durationWeeks) || input.durationWeeks < 1))
    return "Duration must be a whole number of at least one week.";
  if (
    original?.roles.some(
      (role) =>
        isRoleFilled(role, original) &&
        !input.roles.some((next) => next.title.trim().toLowerCase() === role.title.trim().toLowerCase()),
    )
  )
    return "Filled roles must stay on the project with the same title.";
  return null;
}

export function unreadMembershipCount(
  memberships: Membership[],
  seenAt: string | null,
) {
  const seen = seenAt ? Date.parse(seenAt) : 0;
  return memberships.filter(
    (member) =>
      (member.status === "INVITED" && member.initiatedBy === "OWNER") ||
      (["ACTIVE", "DECLINED", "LEFT"].includes(member.status) &&
        Date.parse(member.updatedAt) > seen),
  ).length;
}

export function apiErrorMessage(detail: string, fallback: string) {
  try {
    const parsed = JSON.parse(detail);
    return typeof parsed.message === "string" ? parsed.message : fallback;
  } catch {
    return detail && !detail.trim().startsWith("<") ? detail : fallback;
  }
}
