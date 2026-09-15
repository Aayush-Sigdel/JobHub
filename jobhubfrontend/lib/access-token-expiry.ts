/** Read the expiry supplied by the API token instead of guessing its lifetime. */
export function accessTokenExpiry(token: string | undefined, fallback: number): number {
  if (!token) return fallback;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000 - 60_000
      : fallback;
  } catch {
    return fallback;
  }
}
