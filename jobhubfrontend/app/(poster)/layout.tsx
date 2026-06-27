export default function PosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* TODO: Add Poster Navigation Bar */}
      <header className="p-4 bg-primary text-primary-foreground font-bold">
        Employer Dashboard
      </header>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
