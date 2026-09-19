import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export default function JobMarkdown({
  children,
  compact = false,
  className,
}: {
  children: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "job-markdown min-w-0 text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere] [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_p]:mb-4 [&_p]:whitespace-pre-line [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_li>p]:mb-1 [&_li>ul]:mt-1 [&_li>ol]:mt-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/40 [&_pre]:p-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-foreground [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:leading-6 [&_hr]:my-6 [&_hr]:border-border [&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:accent-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0",
        compact &&
          "[&_p]:mb-0 [&_p]:whitespace-normal [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_h4]:m-0 [&_ul]:mb-0 [&_ol]:mb-0 [&_blockquote]:my-0 [&_pre]:my-0",
        className,
      )}
    >
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          img: () => null,
          a: ({ href, children }) => (
            <a
              href={href}
              {...(/^https?:\/\//i.test(href || "")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div
              role="region"
              aria-label="Content table"
              tabIndex={0}
              className="my-4 max-w-full overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
