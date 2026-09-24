import { ProjectList } from "@/components/collaboration/project-list";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "My projects | JobHub Collaboration" };

export default function MyProjectsPage() {
  return (
    <>
      <CollaborationPageHeading title="My projects" />
      <ProjectList view="mine" />
    </>
  );
}
