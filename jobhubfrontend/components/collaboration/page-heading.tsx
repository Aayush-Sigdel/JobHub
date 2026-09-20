export function CollaborationPageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-6 border-b border-border pb-5">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
