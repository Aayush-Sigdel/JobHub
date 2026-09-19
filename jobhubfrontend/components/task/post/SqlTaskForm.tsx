"use client";

import { useEffect, useState, useTransition } from "react";
import type { TaskBuilderProps } from "@/components/task/post/types";
import { useRouter } from "next/navigation";
import PostTaskHeader from "@/components/task/post/PostTaskHeader";
import ChallengeInfoForm from "@/components/task/post/ChallengeInfoForm";
import { SqlStatementList, type SqlStatement } from "./SqlStatementList";
import MarkdownEditor from "@/components/post-job/MarkdownEditor";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createSQLTaskAction } from "@/lib/actions/tasks";
import { sqlStatementsFromPaste } from "@/lib/task/sql-statements";
import type { CreateSQLTask, SkillLevel, TaskScope } from "@/types/api/tasks";

export default function SqlTaskForm({
  onCreated,
  onCancel,
  onPendingChange,
}: TaskBuilderProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("INTERMEDIATE");
  const [scope, setScope] = useState<TaskScope>("PRIVATE");
  const [setupQueries, setSetupQueries] = useState<SqlStatement[]>([
    { id: "setup-initial", sql: "" },
  ]);
  const [assertions, setAssertions] = useState<SqlStatement[]>([
    { id: "assertion-initial", sql: "" },
  ]);

  useEffect(() => {
    onPendingChange?.(isPending);
    return () => onPendingChange?.(false);
  }, [isPending, onPendingChange]);

  const publish = () => {
    const validSetupQueries = setupQueries.flatMap(({ sql }) =>
      sqlStatementsFromPaste(sql),
    );
    const validAssertions = assertions.flatMap(({ sql }) =>
      sqlStatementsFromPaste(sql),
    );
    if (!title.trim() || !instructions.trim()) {
      toast.error("Add a title and candidate instructions.");
      return;
    }
    if (validAssertions.length === 0) {
      toast.error("Add at least one SQL assertion.");
      return;
    }

    const payload: CreateSQLTask = {
      title: title.trim(),
      instructions: instructions.trim(),
      skillLevel,
      scope,
      setupQueries: validSetupQueries,
      assertions: validAssertions,
    };
    startTransition(async () => {
      try {
        const task = await createSQLTaskAction(payload);
        toast.success("SQL assessment created.");
        if (onCreated) onCreated({ ...task, scope, isOwned: true });
        else router.push("/manage-jobs");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to create the SQL assessment.",
        );
      }
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        publish();
      }}
      className={
        onCreated
          ? "w-full min-w-0 space-y-6"
          : "mx-auto w-full max-w-6xl space-y-6 py-6 pb-16"
      }
    >
      <PostTaskHeader
        assessmentType="sql"
        onCancel={onCancel}
        onPublish={publish}
        isSubmitting={isPending}
      />
      <fieldset
        disabled={isPending}
        className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="min-w-0 space-y-6">
          <ChallengeInfoForm
            title={title}
            onTitleChange={setTitle}
            skillLevel={skillLevel}
            onSkillLevelChange={setSkillLevel}
            scope={scope}
            onScopeChange={setScope}
            assessmentType="sql"
          />
          <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Candidate instructions</h2>
            <div className="space-y-2">
              <Label htmlFor="sql-instructions">
                Problem statement <span aria-hidden="true">*</span>
              </Label>
              <MarkdownEditor
                id="sql-instructions"
                label="Candidate instructions"
                disabled={isPending}
                value={instructions}
                onChange={setInstructions}
                placeholder="Describe the dataset, expected columns, sorting, and any query constraints."
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Explain the result candidates should produce without revealing
                your assertions.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-sm">
                <h2 className="text-base font-semibold">Database setup</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Create tables and add seed data. Statements run in order in an
                  isolated H2 database.
                </p>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {
                  setupQueries.flatMap(({ sql }) => sqlStatementsFromPaste(sql))
                    .length
                }{" "}
                statements
              </span>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              One query per block. A query can span multiple lines. Separate
              queries with semicolons when pasting a script.
            </p>
            <SqlStatementList
              value={setupQueries}
              onChange={setSetupQueries}
              kind="setup"
              disabled={isPending}
            />
          </section>

          <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">
                  Evaluation assertions
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add at least one boolean check for the result.
                </p>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {
                  assertions.flatMap(({ sql }) => sqlStatementsFromPaste(sql))
                    .length
                }{" "}
                assertions
              </span>
            </div>
            <p className="rounded-lg bg-muted/40 p-3 text-xs leading-6 text-muted-foreground">
              Candidate SELECT output is available as{" "}
              <code className="text-foreground">candidate_result</code>. Each
              assertion runs as{" "}
              <code className="text-foreground">
                SELECT (&lt;assertion&gt;) AS result
              </code>
              .
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              One boolean expression per block. Use semicolons to separate
              multiple assertions; line breaks stay inside the same assertion.
            </p>
            <SqlStatementList
              value={assertions}
              onChange={setAssertions}
              kind="assertion"
              disabled={isPending}
            />
          </section>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-lg"
              onClick={() =>
                onCancel ? onCancel() : router.push("/post-task")
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-lg"
            >
              {isPending ? "Creating…" : "Create assessment"}
            </Button>
          </div>
        </div>

        <aside
          className="sticky top-6 min-w-0 overflow-hidden rounded-xl border border-border bg-card"
          aria-label="SQL assessment summary"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Assessment summary</h2>
            <span className="text-xs text-muted-foreground">SQL</span>
          </div>
          <div className="space-y-5 p-5">
            <h3 className="break-words text-lg font-semibold">
              {title.trim() || "Untitled SQL assessment"}
            </h3>
            <dl className="space-y-3 border-y border-border py-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Skill level</dt>
                <dd className="capitalize">{skillLevel.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Visibility</dt>
                <dd className="capitalize">{scope.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Setup statements</dt>
                <dd className="tabular-nums">
                  {
                    setupQueries.flatMap(({ sql }) =>
                      sqlStatementsFromPaste(sql),
                    ).length
                  }
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Assertions</dt>
                <dd className="tabular-nums">
                  {
                    assertions.flatMap(({ sql }) => sqlStatementsFromPaste(sql))
                      .length
                  }
                </dd>
              </div>
            </dl>
            <div>
              <h3 className="text-sm font-medium">Candidate instructions</h3>
              <div className="mt-2 max-h-64 overflow-auto">
                <JobMarkdown>
                  {instructions.trim() ||
                    "Your problem statement will appear here."}
                </JobMarkdown>
              </div>
            </div>
            <p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
              Setup and assertions configure the evaluator. Your candidate
              instructions should include the schema details needed to write a
              solution.
            </p>
          </div>
        </aside>
      </fieldset>
    </form>
  );
}
