import { PosterHeader } from "@/components/poster-header";
import { requireUserRole } from "@/lib/server-user-role";

export default async function PosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUserRole(true);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PosterHeader profile={profile} />
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-4 lg:p-5 flex flex-col min-h-0">
        {children}
      </main>
    </div>
  );
}
