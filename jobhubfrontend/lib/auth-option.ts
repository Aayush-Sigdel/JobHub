import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createBackendTokenRefresher } from "./backend-token-refresh";
import { accessTokenExpiry } from "./access-token-expiry";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const refreshBackendToken = createBackendTokenRefresher(API_BASE_URL);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const loginData = await res.json();
          let employer = loginData.employer;
          let onboardingCompleted = loginData.onboardingCompleted;

          // If employer flag is missing from login response, fetch profile directly
          if (employer === undefined && loginData.accessToken) {
            try {
              const profRes = await fetch(`${API_BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${loginData.accessToken}` },
              });
              if (profRes.ok) {
                const profile = await profRes.json();
                employer = profile.employer;
                if (onboardingCompleted === undefined) {
                  onboardingCompleted = profile.onboardingCompleted;
                }
              }
            } catch {
              // Ignore network error on fallback
            }
          }

          return {
            ...loginData,
            employer: employer ?? false,
            onboardingCompleted: onboardingCompleted ?? false,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.user) {
          token.user = { ...token.user, ...session.user };
        }
        if (session.onboardingCompleted !== undefined && token.user) {
          token.user.onboardingCompleted = session.onboardingCompleted;
        }
        if (session.employer !== undefined && token.user) {
          token.user.employer = session.employer;
        }
        return token;
      }

      if (account && user) {
        if (account.provider === "credentials") {
          return {
            provider: "credentials",
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            accessTokenExpires: accessTokenExpiry(
              user.accessToken,
              Date.now() + 15 * 60 * 1000,
            ),
            roleChecked: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              imageUrl: user.imageUrl || user.image,
              onboardingCompleted: user.onboardingCompleted ?? false,
              employer: user.employer ?? false,
              verified:
                user.verified ?? user.isVerified ?? false,
            },
          };
        }

        return {
          provider: "google",
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          roleChecked: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.image,
            onboardingCompleted: user.onboardingCompleted ?? false,
            employer: user.employer ?? false,
            verified: true, // Google emails are pre-verified
          },
        };
      }

      // For existing active sessions, self-heal employer flag if not yet checked
      if (token.accessToken && token.user && !token.roleChecked) {
        try {
          const profRes = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token.accessToken}` },
          });
          if (profRes.ok) {
            const profile = await profRes.json();
            token.user.employer = Boolean(profile.employer);
            if (profile.onboardingCompleted !== undefined) {
              token.user.onboardingCompleted = Boolean(profile.onboardingCompleted);
            }
          }
        } catch {
          // Ignore network errors on background self-heal
        }
        token.roleChecked = true;
      }

      // Check if token is still valid
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      // Refresh if it's a credentials provider with a valid refreshToken
      if (token.provider === "credentials" && token.refreshToken) {
        return refreshBackendToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
          employer: token.user.employer ?? false,
          imageUrl: token.user.imageUrl ?? undefined,
        };
      }
      return session;
    },
  },
};
