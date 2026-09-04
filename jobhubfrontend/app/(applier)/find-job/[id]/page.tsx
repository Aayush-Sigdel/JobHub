import { notFound } from "next/navigation";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { fetchWithAuth } from "@/lib/service-api";
import type { JobPostDetailResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [detail, profile] = await Promise.all([
      fetchWithAuth<JobPostDetailResponse>(`/jobs/${id}`, {
        cache: "no-store",
      }),
      fetchWithAuth<UserProfileResponse>("/user/profile").catch(() => null),
    ]);
    return <JobDetailView detail={detail} profile={profile} />;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) notFound();
    throw error;
  }
}
