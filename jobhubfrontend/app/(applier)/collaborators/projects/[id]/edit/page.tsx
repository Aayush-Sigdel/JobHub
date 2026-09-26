import { ProjectDetail } from "@/components/collaboration/project-detail";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetail id={id} edit />;
}
