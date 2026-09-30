import { CollaborationExplorePage } from "@/components/collaboration/collaboration-explore-page";

export const metadata = { title: "Explore projects | JobHub Collaboration" };

export default async function ExploreProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const { query } = await searchParams;
  const initialQuery = typeof query === "string" ? query : "";
  return <CollaborationExplorePage initialQuery={initialQuery} />;
}
