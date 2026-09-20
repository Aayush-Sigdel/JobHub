import { CollaborationInbox } from "@/components/collaboration/collaboration-inbox";
import { CollaborationPageHeading } from "@/components/collaboration/page-heading";

export const metadata = { title: "Inbox | JobHub Collaboration" };

export default function CollaborationInboxPage() {
  return (
    <>
      <CollaborationPageHeading
        title="Collaboration inbox"
        description="Respond to invitations, review join requests, and follow your team activity."
      />
      <CollaborationInbox />
    </>
  );
}
