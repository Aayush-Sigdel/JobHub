import { requireUserRole } from "@/lib/server-user-role";
import { CollaborationExplore } from "./collaboration-explore";

export async function CollaborationExplorePage({
  view = "browse",
  initialQuery = "",
}: {
  view?: "browse" | "for-me";
  initialQuery?: string;
}) {
  const { profile } = await requireUserRole(false);
  return (
    <CollaborationExplore
      view={view}
      initialQuery={initialQuery}
      profile={
        profile
          ? {
              name: profile.name,
              title: profile.title,
              imageUrl: profile.imageUrl,
              location: profile.location,
              skills: profile.skills,
              discoverable: profile.discoverable,
            }
          : null
      }
    />
  );
}
