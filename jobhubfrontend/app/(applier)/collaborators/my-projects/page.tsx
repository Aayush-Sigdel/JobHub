import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "My projects | JobHub Collaboration" };

export default function MyProjectsPage() {
  return (
    <>
      <CollaborationPageHeading
        title="My projects"
        description="Manage the projects you own, review requests, and build your team."
      />
      <ProjectList view="mine" />
    </>
  );
}
