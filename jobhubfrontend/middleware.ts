import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) return NextResponse.next();

    const user = token.user as any;
    const isOnboarding = path.startsWith("/onboarding");
    const isEmployerRoute = ["/analytics", "/candidates", "/dashboard", "/manage-jobs", "/post-job", "/post-task"].some((route) => path.startsWith(route));
    const isCandidateRoute = ["/candidate-profile", "/find-job", "/home", "/job-tracker", "/task"].some((route) => path.startsWith(route));

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

    if (user?.employer && isCandidateRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!user?.employer && isEmployerRoute) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

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
    "/home/:path*",
    "/onboarding/:path*",
    "/candidate-profile/:path*",
    "/job-tracker/:path*",
    "/task/:path*",
    "/analytics/:path*",
    "/candidates/:path*",
    "/dashboard/:path*",
    "/find-job/:path*",
    "/manage-jobs/:path*",
    "/post-job/:path*",
    "/post-task/:path*",
  ],
};
