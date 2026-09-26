/** Literal matching keeps skill names such as C++ and C# safe to highlight. */
export default function CandidateHighlight({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const needle = query.trim().toLowerCase();
  if (!needle) return text;

  const parts = [];
  const normalized = text.toLowerCase();
  let offset = 0;
  let index = normalized.indexOf(needle);
  while (index !== -1) {
    parts.push(text.slice(offset, index));
    parts.push(
      <mark
        key={index}
        className="rounded-sm bg-primary px-0.5 font-semibold text-primary-foreground underline decoration-current underline-offset-2"
      >
        {text.slice(index, index + needle.length)}
      </mark>,
    );
    offset = index + needle.length;
    index = normalized.indexOf(needle, offset);
  }
  parts.push(text.slice(offset));
  return <>{parts}</>;
}
