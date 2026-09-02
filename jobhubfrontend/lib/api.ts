// lib/api.ts
// WARNING: Only use this for CLIENT-SIDE real-time operations (e.g., tab-switch telemetry).
// For all other API calls, use fetchWithAuth (reads) or Server Actions (writes).

import axios from "axios";
import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create simple Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add NextAuth Bearer token to every request
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

export default api;
