import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function JobMarkdown({ children }: { children: string }) {
  return (
    <div className="job-markdown min-w-0 break-words text-sm leading-7 text-muted-foreground [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-3 [&_p]:whitespace-pre-line [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_a]:underline [&_a]:underline-offset-4 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs [&_hr]:my-5 [&_hr]:border-border">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{ img: () => null }}
      >
        {children}
      </Markdown>
    </div>
  );
}
