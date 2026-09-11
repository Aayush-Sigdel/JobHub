"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import { Copy, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface CodeEditorProps {
  initialCode?: string;
  value?: string;
  onChange?: (code: string) => void;
  fileName?: string;
  language?: "HTML_CSS" | "JAVA" | "PYTHON" | "SQL";
  readOnly?: boolean;
}

export function CodeEditor({
  initialCode = "",
  value,
  onChange,
  fileName = "index.html",
  language = "HTML_CSS",
  readOnly = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [localCode, setLocalCode] = useState(initialCode);
  const [fontSize, setFontSize] = useState(14);
  const code = value ?? localCode;
  const extensions = useMemo(
    () => [
      { HTML_CSS: html(), JAVA: java(), PYTHON: python(), SQL: sql() }[
        language
      ],
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": `${fileName} code editor`,
      }),
      EditorView.theme(
        {
          "&": {
            height: "100%",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            fontSize: `${fontSize}px`,
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              "var(--font-geist-mono, ui-monospace), SFMono-Regular, Consolas, monospace",
            lineHeight: "1.7",
          },
          ".cm-content": { padding: "16px 0", caretColor: "var(--foreground)" },
          ".cm-line": { padding: "0 16px" },
          ".cm-gutters": {
            backgroundColor: "var(--background)",
            color: "var(--muted-foreground)",
            borderRight: "1px solid var(--border)",
            paddingRight: "8px",
          },
          ".cm-activeLine, .cm-activeLineGutter": {
            backgroundColor: "var(--muted)",
          },
          ".cm-cursor": { borderLeftColor: "var(--foreground)" },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
            backgroundColor:
              "color-mix(in srgb, var(--primary) 25%, transparent) !important",
          },
          "&.cm-focused": { outline: "none" },
        },
        { dark: resolvedTheme === "dark" },
      ),
    ],
    [language, fileName, fontSize, resolvedTheme],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {fileName}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Decrease editor font size"
            disabled={fontSize <= 12}
            onClick={() => setFontSize((size) => Math.max(12, size - 1))}
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="w-8 text-center text-xs tabular-nums text-muted-foreground">
            {fontSize}px
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Increase editor font size"
            disabled={fontSize >= 22}
            onClick={() => setFontSize((size) => Math.min(22, size + 1))}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy code"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                toast.success("Code copied");
              } catch {
                toast.error(
                  "Couldn't copy the code. Select it and copy manually.",
                );
              }
            }}
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          style={{ height: "100%" }}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          extensions={extensions}
          readOnly={readOnly}
          onChange={(next) => {
            setLocalCode(next);
            onChange?.(next);
          }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            autocompletion: true,
          }}
        />
      </div>
      <div className="flex shrink-0 justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
        <span>{readOnly ? "Read only" : "Changes stay in this editor"}</span>
        <span className="tabular-nums">
          {code.length.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}

export default CodeEditor;
