import { getServerSession } from "next-auth";
import { authOptions } from "./auth-option";
import { cache } from "react";

const readServerSession = cache(() => getServerSession(authOptions));

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export class ServiceApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`API Error (${status}): ${detail || "Request was rejected."}`);
    this.name = "ServiceApiError";
  }
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const session = await readServerSession();

  if (session?.error === "RefreshAccessTokenTemporaryError") {
    throw new ServiceApiError(
      503,
      "Your session could not be refreshed. Please try again.",
    );
  }

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    throw new ServiceApiError(401, "Please sign in again.");
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${session.accessToken}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ServiceApiError(response.status, error);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
