import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "For you | JobHub Collaboration" };

export default function RecommendedProjectsPage() {
  return (
    <>
      <CollaborationPageHeading
        title="Projects for you"
        description="Discover teams where your experience fills a missing skill."
      />
      <ProjectList view="for-me" />
    </>
  );
}
