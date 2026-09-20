"use server";

import { fetchWithAuth, ServiceApiError } from "@/lib/service-api";
import { apiErrorMessage, validateProject } from "@/lib/collaboration";
import type {
  CollabResult,
  Membership,
  MembershipAction,
  Project,
  ProjectFilters,
  ProjectInput,
  ProjectStatus,
  Suggestions,
} from "@/types/api/collaboration";

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<CollabResult<T>> {
  try {
    return {
      ok: true,
      data: await fetchWithAuth<T>(`/collab${path}`, {
        method,
        cache: "no-store",
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof ServiceApiError ? error.status : 0,
      message:
        error instanceof ServiceApiError
          ? apiErrorMessage(
              error.detail,
              "This request could not be completed. Please try again.",
            )
          : "Unable to connect. Please try again.",
    };
  }
}
export async function getProjects(
  view: "browse" | "mine" | "for-me",
  filters: ProjectFilters = {},
) {
  const params = new URLSearchParams();
  if (view === "browse")
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  if (view === "for-me") params.set("limit", "20");
  return request<Project[]>(
    `/projects${view === "browse" ? "" : `/${view}`}?${params}`,
  );
}
export async function getProject(id: string) {
  return request<Project>(`/projects/${encodeURIComponent(id)}`);
}
export async function getSuggestions(id: string, lambda: number) {
  return request<Suggestions>(
    `/projects/${encodeURIComponent(id)}/suggestions?lambda=${Math.min(1, Math.max(0, lambda))}`,
  );
}
export async function getMemberships(projectId?: string) {
  return request<Membership[]>(
    projectId
      ? `/projects/${encodeURIComponent(projectId)}/memberships`
      : "/memberships/mine",
  );
}
export async function saveProject(
  input: ProjectInput,
  id?: string,
): Promise<CollabResult<Project>> {
  const error = validateProject(input);
  if (error) return { ok: false, status: 400, message: error };
  return request<Project>(
    `/projects${id ? `/${encodeURIComponent(id)}` : ""}`,
    id ? "PUT" : "POST",
    input,
  );
}
export async function changeProjectStatus(id: string, status: ProjectStatus) {
  return request<Project>(
    `/projects/${encodeURIComponent(id)}/status`,
    "PATCH",
    { status },
  );
}
export async function deleteProject(id: string) {
  return request<void>(`/projects/${encodeURIComponent(id)}`, "DELETE");
}
export async function inviteMember(
  projectId: string,
  userId: string,
  roleId: string,
  message: string,
) {
  return request<Membership>(
    `/projects/${encodeURIComponent(projectId)}/invite`,
    "POST",
    { userId, roleId, message },
  );
}
export async function requestMembership(
  projectId: string,
  roleId: string | undefined,
  message: string,
) {
  return request<Membership>(
    `/projects/${encodeURIComponent(projectId)}/request`,
    "POST",
    { roleId, message },
  );
}
export async function changeMembership(id: string, action: MembershipAction) {
  return request<Membership>(
    `/memberships/${encodeURIComponent(id)}`,
    "PATCH",
    { action },
  );
}
