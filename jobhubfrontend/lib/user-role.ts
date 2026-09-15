type RoleSource = { employer?: boolean | null } | null | undefined;

/** Prefer the current API profile and fall back to the signed session on API failures. */
export function resolveEmployerRole(
  profile: RoleSource,
  sessionUser: RoleSource,
) {
  return profile?.employer ?? sessionUser?.employer ?? false;
}
