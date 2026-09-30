export function CollaborationPageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-7 pt-1 sm:mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
