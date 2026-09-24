import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "For you | JobHub Collaboration" };

export default function RecommendedProjectsPage() {
  return (
    <>
      <CollaborationPageHeading title="Explore projects" />
      <ProjectList view="for-me" />
    </>
  );
}
