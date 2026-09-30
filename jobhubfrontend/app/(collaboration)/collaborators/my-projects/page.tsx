import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "My projects | JobHub Collaboration" };

export default async function MyProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  const initialMineTab = tab === "joined" ? "joined" : "owned";
  return (
    <>
      <CollaborationPageHeading
        title="My projects"
        description="A home for the projects you lead and the teams you’ve joined."
      />
      <ProjectList
        key={initialMineTab}
        view="mine"
        initialMineTab={initialMineTab}
      />
    </>
  );
}
