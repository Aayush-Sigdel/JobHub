import { PosterHeader } from "@/components/poster-header";

export default function PosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="employer-theme flex min-h-screen flex-col bg-background text-foreground">
      <PosterHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
