import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import JobMarkdown from "@/components/jobs/JobMarkdown";

export function ProjectMarkdown({
  children,
  summary = false,
}: {
  children: string;
  summary?: boolean;
}) {
  if (!summary) return <JobMarkdown>{children}</JobMarkdown>;

  // Cards show formatted excerpts without nested links or competing headings.
  return (
    <div className="line-clamp-3 break-words text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        allowedElements={["p", "strong", "em", "del", "code"]}
        unwrapDisallowed
        components={{ p: ({ children }) => <span>{children} </span> }}
      >
        {children}
      </Markdown>
    </div>
  );
}
