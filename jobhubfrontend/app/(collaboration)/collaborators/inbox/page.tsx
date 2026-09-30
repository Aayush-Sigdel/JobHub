import { CollaborationInbox } from "@/components/collaboration/collaboration-inbox";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "Requests | JobHub Collaboration" };

export default function CollaborationInboxPage() {
  return (
    <>
      <CollaborationPageHeading
        title="Requests"
        description="Meet your next teammate. Review invitations, respond to requests, and see where things stand."
      />
      <CollaborationInbox />
    </>
  );
}
