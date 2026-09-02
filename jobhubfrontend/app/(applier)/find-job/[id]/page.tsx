import { notFound } from "next/navigation";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { fetchWithAuth } from "@/lib/service-api";
import type { JobPostDetailResponse } from "@/types/api/jobs";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const detail = await fetchWithAuth<JobPostDetailResponse>(`/jobs/${id}`, { cache: "no-store" });
    return <JobDetailView detail={detail} />;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) notFound();
    throw error;
  }
}
