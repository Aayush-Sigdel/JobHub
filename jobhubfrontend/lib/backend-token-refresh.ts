import { createHash } from "node:crypto";
import type { JWT } from "next-auth/jwt";
import { accessTokenExpiry } from "./access-token-expiry.ts";

type RefreshResult = Pick<
  JWT,
  "accessToken" | "refreshToken" | "accessTokenExpires" | "error"
>;

// The API rotates refresh tokens. Concurrent session reads must share the result,
// including briefly after completion while NextAuth persists the updated cookie.
export function createBackendTokenRefresher(
  baseUrl: string,
  request: typeof fetch = fetch,
  now: () => number = Date.now,
) {
  const refreshes = new Map<
    string,
    { expiresAt: number; result: Promise<RefreshResult> }
  >();

  async function requestTokens(refreshToken: string): Promise<RefreshResult> {
    try {
      const response = await request(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        return {
          accessToken: undefined,
          refreshToken: undefined,
          accessTokenExpires: 0,
          error: "RefreshAccessTokenError",
        };
      }
      if (!response.ok) throw new Error("Session refresh unavailable");
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("accessToken" in data) ||
        typeof data.accessToken !== "string" ||
        !data.accessToken
      ) {
        throw new Error("Invalid refresh response");
      }
      return {
        accessToken: data.accessToken,
        refreshToken:
          "refreshToken" in data &&
          typeof data.refreshToken === "string" &&
          data.refreshToken
            ? data.refreshToken
            : refreshToken,
        accessTokenExpires: accessTokenExpiry(
          data.accessToken,
          now() + 15 * 60 * 1000,
        ),
        error: undefined,
      };
    } catch {
      // Keep the refresh credential on temporary failures so Retry can recover.
      return {
        accessToken: undefined,
        refreshToken,
        accessTokenExpires: now() + 5_000,
        error: "RefreshAccessTokenTemporaryError",
      };
    }
  }

  return async (token: JWT): Promise<JWT> => {
    if (!token.refreshToken) return token;
    const key = createHash("sha256").update(token.refreshToken).digest("hex");
    for (const [id, entry] of refreshes) {
      if (entry.expiresAt <= now()) refreshes.delete(id);
    }
    let entry = refreshes.get(key);
    if (!entry) {
      // Bound process-local storage without caching another user's session data.
      if (refreshes.size >= 128)
        refreshes.delete(refreshes.keys().next().value!);
      entry = {
        expiresAt: Infinity,
        result: requestTokens(token.refreshToken),
      };
      refreshes.set(key, entry);
      const current = entry;
      void entry.result.then((result) => {
        const lifetime = result.error ? 5_000 : 30_000;
        current.expiresAt = now() + lifetime;
        const timer = setTimeout(() => {
          if (refreshes.get(key) === current) refreshes.delete(key);
        }, lifetime);
        timer.unref?.();
      });
    }
    return { ...token, ...(await entry.result) };
  };
}
