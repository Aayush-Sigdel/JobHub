import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/sign-in",
  },
});

export const config = {
  matcher: [
    "/home/:path*",
    "/candidate-profile/:path*",
    "/job-tracker/:path*",
    "/task/:path*",
    "/analytics/:path*",
    "/candidates/:path*",
  ],
};
