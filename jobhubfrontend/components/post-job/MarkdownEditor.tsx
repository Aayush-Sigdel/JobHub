"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import rehypeSanitize from "rehype-sanitize";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="h-64 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground"
    >
      Loading editor…
    </div>
  ),
});

export default function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  height = 260,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  height?: number;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <div
      className="job-markdown-editor"
      data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
    >
      <MDEditor
        value={value}
        onChange={(value) => {
          if (!disabled) onChange(value ?? "");
        }}
        height={height}
        minHeight={Math.min(180, height)}
        preview="edit"
        visibleDragbar={false}
        commandsFilter={(command) =>
          command.name === "image" ? false : command
        }
        textareaProps={{
          id,
          placeholder,
          disabled,
          required,
          "aria-label":
            label ??
            (id === "description" ? "Role description" : "Requirements"),
          "aria-invalid": Boolean(error),
          "aria-describedby": error ? `${id}-error` : undefined,
        }}
        previewOptions={{ rehypePlugins: [rehypeSanitize] }}
      />
    </div>
  );
}
