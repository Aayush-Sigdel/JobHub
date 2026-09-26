import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) return NextResponse.next();

    const user = token.user as
      | {
          employer?: boolean;
          onboardingCompleted?: boolean;
        }
      | undefined;
    const isOnboarding = path.startsWith("/onboarding");

    // 1. If logged in but hasn't completed onboarding, redirect to /onboarding
    if (user && !user.onboardingCompleted && !isOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 2. If user already finished onboarding, prevent visiting /onboarding
    if (user && user.onboardingCompleted && isOnboarding) {
      if (user.employer) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // Role checks run on the server using the current profile. The cookie's
    // role can be stale and redirect back to a page that just redirected here.
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/sign-in",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/collaborators",
    "/collaborators/:path*",
    "/home",
    "/home/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/candidate-profile",
    "/candidate-profile/:path*",
    "/job-tracker",
    "/job-tracker/:path*",
    "/task/:path*",
    "/candidates",
    "/candidates/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/find-job",
    "/find-job/:path*",
    "/manage-jobs",
    "/manage-jobs/:path*",
    "/manage-job",
    "/manage-job/:path*",
    "/post-job",
    "/post-job/:path*",
    "/post-task",
    "/post-task/:path*",
  ],
};
