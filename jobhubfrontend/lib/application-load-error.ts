export function applicationLoadError(error: unknown) {
  const status =
    error && typeof error === "object" && "status" in error
      ? error.status
      : undefined;
  if (status === 401) {
    return {
      title: "Sign in to see your applications",
      message:
        "Your session has expired. Sign in again to load your applications.",
      signIn: true,
    };
  }
  if (status === 403) {
    return {
      title: "Applications aren’t available for this account",
      message: "Sign in with the job-seeker account you used to apply.",
      signIn: true,
    };
  }
  return {
    title: "Applications couldn’t be loaded",
    message:
      typeof status === "number" && status >= 500
        ? "The application service is temporarily unavailable. Please try again shortly."
        : "We couldn’t connect to your applications. Please try again.",
    signIn: false,
  };
}
