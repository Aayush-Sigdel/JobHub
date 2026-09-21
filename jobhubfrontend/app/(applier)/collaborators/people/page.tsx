import { CollaboratorDirectory } from "../_components/collaborator-directory";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "People | JobHub Collaboration" };

export default function CollaborationPeoplePage() {
  return (
    <>
      <CollaborationPageHeading
        title="Find collaborators"
        description="Find candidates for your project’s open roles, review their skills, and invite them to your team."
      />
      <CollaboratorDirectory />
    </>
  );
}
