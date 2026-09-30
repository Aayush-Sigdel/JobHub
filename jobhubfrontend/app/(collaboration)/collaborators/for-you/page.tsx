import { CollaborationExplorePage } from "@/components/collaboration/collaboration-explore-page";

export const metadata = { title: "For you | JobHub Collaboration" };

export default function RecommendedProjectsPage() {
  return <CollaborationExplorePage view="for-me" />;
}
