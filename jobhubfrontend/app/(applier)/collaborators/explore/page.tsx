import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "Explore projects | JobHub Collaboration" };

export default function ExploreProjectsPage() {
  return (
    <>
      <CollaborationPageHeading
        title="Explore projects"
        description="Find an idea you believe in and a team that needs your skills."
      />
      <ProjectList view="browse" />
    </>
  );
}
