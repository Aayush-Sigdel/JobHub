import { Suspense } from "react";
import { ProjectDetail } from "@/components/collaboration/project-detail";
import { LoadingState } from "@/components/collaboration/shared";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectDetail id={id} />
    </Suspense>
  );
}
