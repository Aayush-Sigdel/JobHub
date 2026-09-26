import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "Explore projects | JobHub Collaboration" };

export default async function ExploreProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const { query } = await searchParams;
  const initialQuery = typeof query === "string" ? query : "";
  return (
    <>
      <CollaborationPageHeading title="Explore projects" />
      <ProjectList
        key={initialQuery}
        view="browse"
        initialQuery={initialQuery}
      />
    </>
  );
}
