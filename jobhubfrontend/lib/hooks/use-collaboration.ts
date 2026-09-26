"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getMemberships, getProjects } from "@/lib/actions/collaboration";
import type { CollabResult } from "@/types/api/collaboration";

export class CollaborationError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export async function unwrap<T>(result: Promise<CollabResult<T>>): Promise<T> {
  const response = await result;
  if (!response.ok)
    throw new CollaborationError(response.status, response.message);
  return response.data;
}
export function useCollaborationIdentity() {
  const { data, status } = useSession();
  return {
    userId: data?.user?.id,
    userName: data?.user?.name,
    userImageUrl: data?.user?.imageUrl || data?.user?.image,
    enabled: status === "authenticated" && !data?.user?.employer,
  };
}
export function useMyMemberships() {
  const { userId, enabled } = useCollaborationIdentity();
  return useQuery({
    queryKey: ["collaboration", userId, "memberships"],
    queryFn: () => unwrap(getMemberships()),
    enabled,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
export function useRefreshCollaboration() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["collaboration"] });
}

export function useOwnerMemberships() {
  const { userId, enabled } = useCollaborationIdentity();
  const projects = useQuery({
    queryKey: ["collaboration", userId, "projects", "mine"],
    queryFn: () => unwrap(getProjects("mine")),
    enabled,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const owned = projects.data ?? [];
  const requests = useQuery({
    queryKey: [
      "collaboration",
      userId,
      "owner-inbox",
      owned.map((project) => project.id),
    ],
    queryFn: async () => {
      const outcomes = await Promise.allSettled(
        owned.map(async (project) => {
          const members = await unwrap(getMemberships(project.id));
          return members.map((membership) => ({
            ...membership,
            projectId: project.id,
            projectTitle: project.title,
            project,
          }));
        }),
      );
      return {
        memberships: outcomes.flatMap((result) =>
          result.status === "fulfilled" ? result.value : [],
        ),
        failedProjects: owned.filter(
          (_, index) => outcomes[index].status === "rejected",
        ),
      };
    },
    enabled: enabled && projects.isSuccess,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  return { projects, requests };
}
