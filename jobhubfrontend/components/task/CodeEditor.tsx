"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { EditorView } from "@codemirror/view";
import {
  Play,
  Settings,
  Minus,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export interface CodeEditorProps {
  initialCode?: string;
  onChange?: (code: string) => void;
  fileName?: string;
  className?: string;
  onTest?: () => void;
  onSubmitFinal?: () => void;
  isTesting?: boolean;
  isSubmitting?: boolean;
  isSubmitLocked?: boolean;
  submitLockMessage?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = "",
  onChange,
  className = "",
  onTest,
  onSubmitFinal,
  isTesting = false,
  isSubmitting = false,
  isSubmitLocked = false,
  submitLockMessage = "Reach required matching score to unlock submission",
}) => {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState<string>(initialCode);
  const [fontSize, setFontSize] = useState<number>(15);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync initialCode if changed externally
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleChange = useCallback(
    (value: string) => {
      setCode(value);
      if (onChange) {
        onChange(value);
      }
    },
    [onChange]
  );

  const charCount = useMemo(() => code.length, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setCode("");
    if (onChange) onChange("");
    toast.info("Editor cleared");
  };

  // Keyboard shortcut: Ctrl + Enter to Test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (onTest) onTest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTest]);

  // CodeMirror Theme Extension (Adapts instantly to dark & light mode)
  const isDark = resolvedTheme === "dark";
  const editorTheme = useMemo<Extension>(() => {
    return EditorView.theme(
      {
        "&": {
          height: "100%",
          backgroundColor: isDark ? "#14151a" : "#ffffff",
          color: isDark ? "#f8fafc" : "#1e293b",
          fontSize: `${fontSize}px`,
          fontFamily:
            'var(--font-heading), "JetBrains Mono", "Fira Code", monospace',
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "inherit",
          lineHeight: "1.7",
        },
        ".cm-content": {
          padding: "16px 0",
          caretColor: isDark ? "#f15641" : "#ed2b12",
        },
        ".cm-line": {
          padding: "0 20px",
        },
        ".cm-gutters": {
          backgroundColor: isDark ? "#191a21" : "#f8fafc",
          color: isDark ? "#64748b" : "#94a3b8",
          borderRight: `1px solid ${isDark ? "#262833" : "#e2e8f0"}`,
          paddingRight: "8px",
          minWidth: "48px",
          userSelect: "none",
        },
        ".cm-lineNumbers .cm-gutterElement": {
          padding: "0 12px 0 16px",
          textAlign: "right",
        },
        ".cm-activeLine": {
          backgroundColor: isDark
            ? "rgba(241, 86, 65, 0.08)"
            : "rgba(237, 43, 18, 0.06)",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "transparent",
          color: isDark ? "#f15641" : "#ed2b12",
          fontWeight: "bold",
        },
        "&.cm-focused .cm-selectionBackground, ::selection": {
          backgroundColor: isDark
            ? "rgba(241, 86, 65, 0.25) !important"
            : "rgba(237, 43, 18, 0.18) !important",
        },
      },
      { dark: isDark }
    );
  }, [isDark, fontSize]);

  const extensions = useMemo(() => {
    return [
      html({ matchClosingTags: true, autoCloseTags: true }),
      css(),
      editorTheme,
      EditorView.lineWrapping,
    ];
  }, [editorTheme]);

  return (
    <div
      className={`flex flex-col w-full h-full bg-card text-foreground select-none overflow-hidden font-sans ${className}`}
    >
      {/* 1. Editor Header */}
      <div className="bg-muted/40 border-b border-border px-5 py-3 flex items-center justify-between gap-3 text-sm font-mono shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-foreground text-sm">Editor</span>
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-sans border border-border">
            CTRL SHIFT E
          </span>
        </div>

        <div className="flex items-center gap-4 relative">
          <span className="text-muted-foreground font-mono text-xs">
            <strong className="text-foreground font-semibold text-sm">
              {charCount}
            </strong>{" "}
            characters
          </span>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Settings Popup */}
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-popover text-popover-foreground border border-border rounded-2xl shadow-xl p-2.5 z-50 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-foreground px-1">
                <span>Font Size:</span>
                <div className="flex items-center gap-1 bg-muted border border-border rounded-xl px-1.5 py-0.5">
                  <button
                    onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                    className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono w-7 text-center font-bold">
                    {fontSize}px
                  </span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                    className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-border my-0.5" />

              <button
                onClick={handleCopy}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-foreground hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Copy Code</span>
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <button
                onClick={handleClear}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Clear All</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Native CodeMirror 6 Body (Zero-Delay, Instantly Styled) */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-card">
        <CodeMirror
          value={code}
          height="100%"
          style={{ height: "100%" }}
          extensions={extensions}
          onChange={handleChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* 3. Bottom Action Bar */}
      <div className="bg-muted/30 border-t border-border p-4 flex items-center gap-3.5 shrink-0">
        <button
          onClick={onTest || (() => toast.info("Testing code..."))}
          disabled={isTesting}
          className="flex-1 flex items-center justify-center gap-2.5 h-11 px-5 rounded-xl border border-border bg-card hover:bg-muted active:scale-[0.99] text-foreground font-bold text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin text-pacific-blue-500" />
          ) : (
            <Play className="w-4 h-4 fill-current text-pacific-blue-500" />
          )}
          <span>Test Code</span>
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono border border-border font-normal">
            CTRL ENTER
          </span>
        </button>

        {isSubmitLocked ? (
          <button
            onClick={() => toast.warning(submitLockMessage)}
            className="flex-1 flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-muted/80 text-muted-foreground border border-border/80 font-bold text-xs transition-all shadow-none cursor-not-allowed opacity-80"
            title={submitLockMessage}
          >
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Submit (Locked)</span>
          </button>
        ) : (
          <button
            onClick={
              onSubmitFinal || (() => toast.success("Final answer submitted!"))
            }
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2.5 h-11 px-5 rounded-xl bg-tomato-500 hover:bg-tomato-600 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm shadow-tomato-500/25 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit Final Answer</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
