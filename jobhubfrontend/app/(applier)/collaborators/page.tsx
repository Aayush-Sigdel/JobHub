import { redirect } from "next/navigation";

const destinations: Record<string, string> = {
  browse: "/collaborators/explore",
  "for-me": "/collaborators/for-you",
  mine: "/collaborators/my-projects",
  inbox: "/collaborators/inbox",
  people: "/collaborators/my-projects",
};

export default async function CollaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  const destination =
    typeof tab === "string" && Object.hasOwn(destinations, tab)
      ? destinations[tab]
      : destinations.browse;
  redirect(destination);
}
