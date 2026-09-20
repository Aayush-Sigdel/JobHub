import { CollaboratorDirectory } from "../_components/collaborator-directory";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "People | JobHub Collaboration" };

export default function CollaborationPeoplePage() {
  return (
    <>
      <CollaborationPageHeading
        title="Find collaborators"
        description="Meet candidates whose experience, skills, and professional interests align with yours."
      />
      <CollaboratorDirectory />
    </>
  );
}
