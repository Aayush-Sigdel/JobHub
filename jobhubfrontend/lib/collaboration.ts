import type {
  Membership,
  MembershipAction,
  Project,
  ProjectInput,
  ProjectRole,
} from "../types/api/collaboration.ts";

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
  if (original && input.teamSize < original.activeMemberCount)
    return "Team size cannot be smaller than the current team.";
  if (!input.roles.length || input.roles.length > input.teamSize - 1)
    return "Add at least one role, with no more roles than available seats. You occupy one seat.";
  if (input.roles.some((role) => !role.title.trim()))
    return "Give every role a title.";
  if (
    input.roles.some((role) =>
      role.requiredSkills.some((skill) => !skill.name.trim()),
    )
  )
    return "Name each required skill or remove the empty skill.";
  if (
    input.commitmentHoursPerWeek !== undefined &&
    (!Number.isFinite(input.commitmentHoursPerWeek) ||
      input.commitmentHoursPerWeek <= 0)
  )
    return "Weekly commitment must be greater than zero.";
  if (
    original?.roles.some(
      (role) =>
        isRoleFilled(role, original) &&
        !input.roles.some((next) => next.id === role.id),
    )
  )
    return "Filled roles must stay on the project.";
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
