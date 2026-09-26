"use server";

import { fetchWithAuth, ServiceApiError } from "@/lib/service-api";
import {
  apiErrorMessage,
  projectFromDetail,
  projectFromSuggestion,
  membershipFromResponse,
  projectPayload,
  suggestionParams,
  validateProject,
} from "@/lib/collaboration";
import type {
  CollabResult,
  Membership,
  MembershipAction,
  MembershipResponse,
  Project,
  ProjectDetailResponse,
  ProjectFilters,
  ProjectInput,
  ProjectStatus,
  ProjectSuggestionResponse,
  SuggestionFilters,
  Suggestions,
  CollaborationCandidateProfile,
} from "@/types/api/collaboration";
import type { UserProfileResponse } from "@/types/api/user";

async function apiRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<CollabResult<T>> {
  try {
    return {
      ok: true,
      data: await fetchWithAuth<T>(path, {
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
function request<T>(path: string, method = "GET", body?: unknown) {
  return apiRequest<T>(`/collab${path}`, method, body);
}

export async function getCandidateProfile(
  id: string,
): Promise<CollabResult<CollaborationCandidateProfile>> {
  const result = await apiRequest<UserProfileResponse>(
    `/user/profile/${encodeURIComponent(id)}`,
  );
  if (!result.ok) return result;
  const {
    id: userId,
    name,
    title,
    bio,
    location,
    skills,
    experiences,
    educations,
  } = result.data;
  return {
    ok: true,
    data: {
      id: userId,
      name,
      title,
      bio,
      location,
      skills,
      experiences,
      educations,
    },
  };
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
  if (view === "for-me") {
    const result = await request<ProjectSuggestionResponse[]>(
      `/projects/for-me?${params}`,
    );
    if (!result.ok) return result;
    return { ok: true as const, data: result.data.map(projectFromSuggestion) };
  }
  return request<Project[]>(
    `/projects${view === "browse" ? "" : `/${view}`}?${params}`,
  );
}
export async function getProject(id: string): Promise<CollabResult<Project>> {
  const result = await request<ProjectDetailResponse>(
    `/projects/${encodeURIComponent(id)}`,
  );
  if (!result.ok) return result;
  return { ok: true, data: projectFromDetail(result.data) };
}
export async function getSuggestions(
  id: string,
  filters: SuggestionFilters = {},
) {
  return request<Suggestions>(
    `/projects/${encodeURIComponent(id)}/suggestions?${suggestionParams(filters)}`,
  );
}
export async function getMemberships(projectId?: string) {
  const result = await request<MembershipResponse[]>(
    projectId
      ? `/projects/${encodeURIComponent(projectId)}/memberships`
      : "/memberships/mine",
  );
  if (!result.ok) return result;
  return { ok: true as const, data: result.data.map(membershipFromResponse) };
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
    projectPayload(input, !!id),
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
  roleId: string | undefined,
  message: string,
) {
  return membershipRequest(
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
  return membershipRequest(
    `/projects/${encodeURIComponent(projectId)}/request`,
    "POST",
    { roleId, message },
  );
}
export async function changeMembership(id: string, action: MembershipAction) {
  return membershipRequest(`/memberships/${encodeURIComponent(id)}`, "PATCH", {
    action,
  });
}

async function membershipRequest(
  path: string,
  method: string,
  body: unknown,
): Promise<CollabResult<Membership>> {
  const result = await request<MembershipResponse>(path, method, body);
  if (!result.ok) return result;
  return { ok: true, data: membershipFromResponse(result.data) };
}
