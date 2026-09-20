"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getMemberships } from "@/lib/actions/collaboration";
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
