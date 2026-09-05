"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  RotateCcw,
  Sparkles,
  Table as TableIcon,
  Check,
  AlertCircle,
  Code2,
  FileCode,
  Copy,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface SQLLineBlock {
  id: string;
  code: string;
  output?: {
    success: boolean;
    durationMs: number;
    rowCount?: number;
    columns?: string[];
    rows?: Record<string, any>[];
    message?: string;
  } | null;
}

interface SQLNotebookProps {
  lines: SQLLineBlock[];
  setLines: React.Dispatch<React.SetStateAction<SQLLineBlock[]>>;
  onRunLine: (lineId: string) => void;
  onRunAll: () => void;
  isEvaluating?: boolean;
}

// SQL keyword color mapping for line tags
function getLineKeyword(code: string): string | null {
  const firstWord = code.trim().split(/\s+/)[0]?.toUpperCase();
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "FULL",
    "GROUP",
    "HAVING",
    "ORDER",
    "LIMIT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "WITH",
    "UNION",
    "VALUES",
    "SET",
    "COUNT",
    "SUM",
    "AVG",
  ];
  return keywords.includes(firstWord) ? firstWord : null;
}

export default function SQLNotebook({
  lines,
  setLines,
  onRunLine,
  onRunAll,
  isEvaluating,
}: SQLNotebookProps) {
  const [activeLineId, setActiveLineId] = useState<string>(lines[0]?.id || "");
  const [viewMode, setViewMode] = useState<"blocks" | "preview">("blocks");
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Focus input when active line changes
  const focusLineInput = (id: string) => {
    setTimeout(() => {
      const el = inputRefs.current.get(id);
      if (el) {
        el.focus();
      }
    }, 20);
  };

  const updateLineCode = useCallback(
    (lineId: string, newCode: string) => {
      setLines((prev) =>
        prev.map((line) => (line.id === lineId ? { ...line, code: newCode } : line))
      );
    },
    [setLines]
  );

  const addLineBelow = useCallback(
    (targetLineId?: string, initialCode = "") => {
      const newLine: SQLLineBlock = {
        id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: initialCode,
        output: null,
      };

      setLines((prev) => {
        if (!targetLineId) return [...prev, newLine];
        const index = prev.findIndex((l) => l.id === targetLineId);
        if (index === -1) return [...prev, newLine];
        const updated = [...prev];
        updated.splice(index + 1, 0, newLine);
        return updated;
      });

      setActiveLineId(newLine.id);
      focusLineInput(newLine.id);
    },
    [setLines]
  );

  const deleteLine = useCallback(
    (lineId: string) => {
      setLines((prev) => {
        if (prev.length <= 1) {
          // If only 1 line, just clear it instead of removing
          return [{ ...prev[0], code: "", output: null }];
        }
        const index = prev.findIndex((l) => l.id === lineId);
        const filtered = prev.filter((l) => l.id !== lineId);
        const nextTarget = filtered[Math.max(0, index - 1)];
        if (nextTarget) {
          setActiveLineId(nextTarget.id);
          focusLineInput(nextTarget.id);
        }
        return filtered;
      });
    },
    [setLines]
  );

  const moveLine = useCallback(
    (lineId: string, direction: "up" | "down") => {
      setLines((prev) => {
        const index = prev.findIndex((l) => l.id === lineId);
        if (index === -1) return prev;
        if (direction === "up" && index === 0) return prev;
        if (direction === "down" && index === prev.length - 1) return prev;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const updated = [...prev];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);
        return updated;
      });
    },
    [setLines]
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    lineId: string,
    index: number
  ) => {
    // 1. Enter key: Create new line code block below
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      addLineBelow(lineId);
      return;
    }

    // 2. Shift + Enter / Ctrl + Enter: Run current line
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRunLine(lineId);
      return;
    }

    // 3. Backspace on empty line: Delete this code block
    if (e.key === "Backspace" && (e.currentTarget.value === "" || e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0)) {
      if (lines.length > 1 && e.currentTarget.value === "") {
        e.preventDefault();
        deleteLine(lineId);
        return;
      }
    }

    // 4. Up arrow: Focus line block above
    if (e.key === "ArrowUp") {
      if (index > 0) {
        e.preventDefault();
        const prevId = lines[index - 1].id;
        setActiveLineId(prevId);
        focusLineInput(prevId);
      }
      return;
    }

    // 5. Down arrow: Focus line block below
    if (e.key === "ArrowDown") {
      if (index < lines.length - 1) {
        e.preventDefault();
        const nextId = lines[index + 1].id;
        setActiveLineId(nextId);
        focusLineInput(nextId);
      }
      return;
    }
  };

  const resetAllLines = useCallback(() => {
    setLines([
      { id: `line_${Date.now()}_1`, code: "SELECT *", output: null },
      { id: `line_${Date.now()}_2`, code: "FROM employees", output: null },
      { id: `line_${Date.now()}_3`, code: "WHERE status = 'Active'", output: null },
      { id: `line_${Date.now()}_4`, code: "ORDER BY salary DESC;", output: null },
    ]);
  }, [setLines]);

  const clearOutputs = useCallback(() => {
    setLines((prev) => prev.map((l) => ({ ...l, output: null })));
  }, [setLines]);

  const fullCombinedSql = lines
    .map((l) => l.code)
    .filter((c) => c.trim().length > 0)
    .join("\n");

  const copyFullSql = () => {
    navigator.clipboard.writeText(fullCombinedSql);
    toast.success("Copied full SQL script to clipboard");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRunAll}
            disabled={isEvaluating}
            className="h-8 rounded-xl font-bold text-xs gap-1.5 bg-card hover:bg-muted"
          >
            <Play className="size-3 text-emerald-500 fill-emerald-500" />
            <span>Run All ({lines.length} lines)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => addLineBelow(lines[lines.length - 1]?.id)}
            className="h-8 rounded-xl font-bold text-xs gap-1.5 bg-card hover:bg-muted"
          >
            <Plus className="size-3.5" />
            <span>Add Line Block</span>
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Mode Switcher */}
          <div className="flex items-center bg-muted p-0.5 rounded-xl border border-border">
            <button
              onClick={() => setViewMode("blocks")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === "blocks"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Line Blocks
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === "preview"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Script View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-[11px] font-mono font-medium text-muted-foreground bg-muted"
          >
            Enter = Next Line • Shift+Enter = Run
          </Badge>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearOutputs}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Clear Outputs"
          >
            Clear Outputs
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={resetAllLines}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Reset Lines"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "blocks" ? (
        /* Line-by-Line Code Blocks Editor */
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-muted/10 font-mono">
          {lines.map((line, idx) => {
            const isActive = line.id === activeLineId;
            const keyword = getLineKeyword(line.code);

            return (
              <div
                key={line.id}
                onClick={() => {
                  setActiveLineId(line.id);
                  focusLineInput(line.id);
                }}
                className={`rounded-2xl border transition-all duration-150 overflow-hidden bg-card ${
                  isActive
                    ? "border-primary/60 shadow-md ring-1 ring-primary/20"
                    : "border-border hover:border-border/80 shadow-2xs"
                }`}
              >
                {/* 1 Code Block = 1 Line of Code Row */}
                <div className="flex items-center gap-2 px-3 py-2 bg-card">
                  {/* Line Number Badge */}
                  <span className="font-mono text-xs font-bold text-muted-foreground w-8 text-right select-none shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* SQL Keyword Badge */}
                  {keyword && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 select-none">
                      {keyword}
                    </span>
                  )}

                  {/* Single Line Code Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(line.id, el);
                        else inputRefs.current.delete(line.id);
                      }}
                      type="text"
                      value={line.code}
                      onChange={(e) => updateLineCode(line.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, line.id, idx)}
                      onFocus={() => setActiveLineId(line.id)}
                      placeholder={
                        idx === 0
                          ? "SELECT * FROM table_name;"
                          : "Type SQL statement or clause (press Enter for next line)..."
                      }
                      className="w-full bg-transparent font-mono text-xs md:text-sm text-foreground focus:outline-none border-0 p-1 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Action Controls for this line */}
                  <div className="flex items-center gap-1 shrink-0 select-none">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRunLine(line.id);
                      }}
                      className="h-7 px-2 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                      title="Run Line (Shift+Enter)"
                    >
                      <Play className="size-3 fill-emerald-600 dark:fill-emerald-400" />
                      <span className="hidden sm:inline text-[11px]">Run</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLine(line.id, "up");
                      }}
                      disabled={idx === 0}
                      className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-20"
                      title="Move Line Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLine(line.id, "down");
                      }}
                      disabled={idx === lines.length - 1}
                      className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-20"
                      title="Move Line Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        addLineBelow(line.id);
                      }}
                      className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                      title="Add Line Block Below (Enter)"
                    >
                      <Plus className="size-3.5" />
                    </Button>

                    {lines.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLine(line.id);
                        }}
                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                        title="Delete Line (Backspace on empty line)"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Line Output Result (if evaluated) */}
                {line.output && (
                  <div className="border-t border-border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <TableIcon className="size-3 text-primary" />
                        <span>Line Result</span>
                        {line.output.rowCount !== undefined && (
                          <span className="text-muted-foreground font-normal">
                            ({line.output.rowCount} row{line.output.rowCount === 1 ? "" : "s"})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {line.output.durationMs}ms
                      </span>
                    </div>

                    {line.output.success ? (
                      line.output.rows && line.output.rows.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
                          <table className="w-full text-xs font-mono text-left divide-y divide-border">
                            <thead className="bg-muted/60 text-foreground font-bold">
                              <tr>
                                <th className="px-2.5 py-1.5 text-[10px] text-muted-foreground w-8">
                                  #
                                </th>
                                {(line.output?.columns || Object.keys(line.output.rows[0])).map(
                                  (col) => (
                                    <th key={col} className="px-3 py-1.5 whitespace-nowrap">
                                      {col}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-card">
                              {line.output.rows.map((row, rIdx) => (
                                <tr
                                  key={rIdx}
                                  className="hover:bg-muted/40 transition-colors"
                                >
                                  <td className="px-2.5 py-1 text-[10px] text-muted-foreground">
                                    {rIdx + 1}
                                  </td>
                                  {(line.output?.columns || Object.keys(row)).map((col) => (
                                    <td
                                      key={col}
                                      className="px-3 py-1 whitespace-nowrap text-foreground/90"
                                    >
                                      {row[col] !== null && row[col] !== undefined
                                        ? String(row[col])
                                        : "NULL"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 p-2 bg-card rounded-lg border border-border">
                          <Check className="size-3 text-emerald-500" />
                          <span>Line executed with 0 rows returned.</span>
                        </div>
                      )
                    ) : (
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-600 dark:text-red-400 font-mono">
                        {line.output.message || "Query syntax error"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Add Bottom Button */}
          <div className="text-center pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addLineBelow(lines[lines.length - 1]?.id)}
              className="rounded-xl border-dashed border-border hover:border-primary/60 font-bold text-xs gap-1.5 px-4 h-8 bg-muted/20 hover:bg-muted/40"
            >
              <Plus className="size-3 text-primary" />
              <span>Add Line [{String(lines.length + 1).padStart(2, "0")}]</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Full Combined Script Preview */
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Compiled SQL Script ({lines.length} Line Blocks)
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyFullSql}
              className="h-8 rounded-xl text-xs font-bold gap-1.5"
            >
              <Copy className="size-3.5" />
              <span>Copy Script</span>
            </Button>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-muted/30 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
            {fullCombinedSql || "-- No SQL lines added yet."}
          </div>
        </div>
      )}
    </div>
  );
}
