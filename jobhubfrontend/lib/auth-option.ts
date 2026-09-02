import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const refreshBackendToken = async (token: any) => {
  if (!token?.refreshToken) {
    return token;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!response.ok) {
      console.warn("Token refresh failed: server responded with", response.status);
      return {
        ...token,
        refreshToken: undefined,
        accessTokenExpires: Date.now() + 60 * 60 * 1000,
        error: "RefreshAccessTokenError",
      };
    }

    const text = await response.text();
    if (!text) return token;

    const refreshedTokens = JSON.parse(text);

    return {
      ...token,
      accessToken: refreshedTokens.accessToken || token.accessToken,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      refreshToken: undefined,
      accessTokenExpires: Date.now() + 60 * 60 * 1000,
      error: "RefreshAccessTokenError",
    };
  }
};

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
          return await res.json();
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
          token.user = { ...(token.user as any), ...session.user };
        }
        if (session.onboardingCompleted !== undefined && token.user) {
          (token.user as any).onboardingCompleted = session.onboardingCompleted;
        }
        return token;
      }

      if (account && user) {
        if (account.provider === "credentials") {
          return {
            provider: "credentials",
            accessToken: (user as any).accessToken,
            refreshToken: (user as any).refreshToken,
            accessTokenExpires: Date.now() + 15 * 60 * 1000,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              imageUrl: (user as any).imageUrl || user.image,
              onboardingCompleted: (user as any).onboardingCompleted ?? false,
              employer: (user as any).employer ?? false,
              verified: (user as any).verified ?? (user as any).isVerified ?? false,
            },
          };
        }

        return {
          provider: "google",
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.image,
            onboardingCompleted: (user as any).onboardingCompleted ?? false,
            employer: (user as any).employer ?? false,
            verified: true, // Google emails are pre-verified
          },
        };
      }

      // Check if token is still valid
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
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
        session.user = token.user as any;
      }
      return session;
    },
  },
};
