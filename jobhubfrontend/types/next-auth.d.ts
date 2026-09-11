import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id?: string;
      imageUrl?: string;
      onboardingCompleted?: boolean;
      verified?: boolean;
      employer?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isVerified?: boolean;
    accessToken?: string;
    refreshToken?: string;
    imageUrl?: string;
    onboardingCompleted?: boolean;
    verified?: boolean;
    employer?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    roleChecked?: boolean;
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      imageUrl?: string | null;
      onboardingCompleted?: boolean;
      verified?: boolean;
      employer?: boolean;
    };
  }
}
