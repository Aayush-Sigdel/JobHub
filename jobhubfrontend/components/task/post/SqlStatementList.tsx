"use client";

import { useState } from "react";
import { IconPlus, IconTrash, IconArrowBackUp } from "@tabler/icons-react";
import CodeEditor from "@/components/task/CodeEditor";
import { Button } from "@/components/ui/button";
import { sqlStatementsFromPaste } from "@/lib/task/sql-statements";

export type SqlStatement = { id: string; sql: string };

export function SqlStatementList({
  value,
  onChange,
  kind,
  disabled,
}: {
  value: SqlStatement[];
  onChange: (value: SqlStatement[]) => void;
  kind: "setup" | "assertion";
  disabled: boolean;
}) {
  const [undo, setUndo] = useState<{
    previous: SqlStatement[];
    count: number;
  } | null>(null);
  const label = kind === "setup" ? "Statement" : "Assertion";
  const update = (next: SqlStatement[]) => {
    setUndo(null);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {undo && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs"
        >
          <span>
            Paste split into {undo.count}{" "}
            {kind === "setup" ? "statements" : "assertions"}.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => update(undo.previous)}
          >
            <IconArrowBackUp className="size-3.5" />
            Undo split
          </Button>
        </div>
      )}
      {value.map((statement, index) => (
        <div
          key={statement.id}
          className="overflow-hidden rounded-lg border border-border bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring"
        >
          <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-3 py-1.5">
            <span className="text-xs font-medium">
              {label} {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={
                disabled || (kind === "assertion" && value.length === 1)
              }
              aria-label={`Remove ${kind} ${index + 1}`}
              onClick={() =>
                update(value.filter((item) => item.id !== statement.id))
              }
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
          <div
            style={{
              height: Math.min(
                260,
                Math.max(
                  110,
                  statement.sql.split(/\r\n|\n|\r/).length * 23 + 36,
                ),
              ),
            }}
          >
            <CodeEditor
              compact
              language="SQL"
              fileName={`${kind}-${index + 1}.sql`}
              readOnly={disabled}
              value={statement.sql}
              placeholder={
                kind === "setup"
                  ? "CREATE TABLE employees (id INT, name VARCHAR(100));"
                  : "(SELECT COUNT(*) FROM candidate_result) = 3"
              }
              onChange={(sql) =>
                update(
                  value.map((item) =>
                    item.id === statement.id ? { ...item, sql } : item,
                  ),
                )
              }
              onPaste={(_text, nextValue) => {
                const statements = sqlStatementsFromPaste(nextValue);
                if (statements.length < 2) return false;
                const replacements = statements.map((sql, i) => ({
                  id: i === 0 ? statement.id : crypto.randomUUID(),
                  sql,
                }));
                setUndo({ previous: value, count: replacements.length });
                onChange([
                  ...value.slice(0, index),
                  ...replacements,
                  ...value.slice(index + 1),
                ]);
                return true;
              }}
            />
          </div>
        </div>
      ))}
      {!value.length && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No setup statements yet. Add tables and sample data if your assessment
          needs them.
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className="rounded-lg"
        onClick={() => update([...value, { id: crypto.randomUUID(), sql: "" }])}
      >
        <IconPlus className="size-3.5" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  );
}
