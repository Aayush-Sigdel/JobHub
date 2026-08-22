import { cookies } from "next/headers";

export const ACCESS_COOKIE = process.env.ACCESS_TOKEN_COOKIE || "access_token";
export const REFRESH_COOKIE =
  process.env.REFRESH_TOKEN_COOKIE || "refresh_token";

const isProduction = process.env.NODE_ENV === "production";

export const setAuthCookies = async (
  access: string,
  refresh: string,
  secure: boolean = isProduction,
) => {
  const cookieStore = await cookies();

  const commonOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

  // Access Token: 15 minutes
  cookieStore.set(ACCESS_COOKIE, access, {
    ...commonOptions,
    maxAge: 60 * 15,
  });

  // Refresh Token: 7 days (60s * 60m * 24h * 7d)
  cookieStore.set(REFRESH_COOKIE, refresh, {
    ...commonOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
};

export const getTokens = async () => {
  const cookieStore = await cookies();
  return {
    access: cookieStore.get(ACCESS_COOKIE)?.value,
    refresh: cookieStore.get(REFRESH_COOKIE)?.value,
  };
};
