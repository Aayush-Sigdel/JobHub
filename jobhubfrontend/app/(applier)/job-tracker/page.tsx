import React, { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";
import { resolveEmployerRole } from "@/lib/user-role";
import { fetchWithAuth } from "@/lib/service-api";
import { JobTrackerTabs } from "@/components/job-tracker/JobTrackerTabs";
import type { JobApplicationResponse } from "@/components/job-tracker/ApplicationCard";
import type { UserProfileResponse } from "@/types/api/user";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { applicationLoadError } from "@/lib/application-load-error";

export const dynamic = "force-dynamic";

function TrackerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-full sm:w-96 bg-muted/60 rounded-full border border-border" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-56 bg-card border border-border rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

export default async function JobTrackerPage() {
  const session = await getServerSession(authOptions);
  let profile: UserProfileResponse | null = null;
  try {
    profile = await fetchWithAuth<UserProfileResponse>("/user/profile");
  } catch {}

  if (resolveEmployerRole(profile, session?.user)) {
    redirect("/dashboard");
  }

  let applications: JobApplicationResponse[] = [];
  let errorMsg = "";
  let errorTitle = "";
  let signInRequired = false;

  try {
    applications = await fetchWithAuth<JobApplicationResponse[]>(
      "/jobs/my-applications",
      { cache: "no-store" },
    );
  } catch (error) {
    const failure = applicationLoadError(error);
    errorMsg = failure.message;
    errorTitle = failure.title;
    signInRequired = failure.signIn;
  }

  const applied = applications.filter((a) => a.status === "APPLIED");
  const inReview = applications.filter((a) => a.status === "IN_REVIEW");
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED");
  const accepted = applications.filter((a) => a.status === "ACCEPTED");
  const rejected = applications.filter((a) => a.status === "REJECTED");

  return (
    <div className="py-4 md:py-6 text-foreground">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Track your applications
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Pick up a draft, revisit a saved role, or see where your
              applications stand.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-xl h-10 px-4 gap-2 self-start sm:self-auto shrink-0"
          >
            <Link href="/find-job">
              <Search className="h-4 w-4" />
              <span>Find jobs</span>
            </Link>
          </Button>
        </div>

        <Suspense fallback={<TrackerSkeleton />}>
          <JobTrackerTabs
            loadError={errorMsg}
            errorTitle={errorTitle}
            signInRequired={signInRequired}
            applied={applied}
            inReview={inReview}
            shortlisted={shortlisted}
            accepted={accepted}
            rejected={rejected}
          />
        </Suspense>
      </div>
    </div>
  );
}
