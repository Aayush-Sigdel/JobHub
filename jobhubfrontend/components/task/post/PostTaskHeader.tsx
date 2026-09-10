"use client";

import Link from "next/link";
import { IconArrowLeft, IconLoader2, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PostTaskHeaderProps {
  onPublish: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  assessmentType?: "design" | "programming" | "sql";
}

const taskCopy = {
  design: {
    title: "Create a CSS assessment",
    description:
      "Set a visual target and define what a successful match looks like.",
  },
  programming: {
    title: "Create a programming assessment",
    description:
      "Define the problem, method signature, and test cases for your candidates.",
  },
  sql: {
    title: "Create a SQL assessment",
    description:
      "Build a dataset and define the query results you want candidates to produce.",
  },
};

export default function PostTaskHeader({
  onPublish,
  onCancel,
  isSubmitting = false,
  assessmentType = "design",
}: PostTaskHeaderProps) {
  const copy = taskCopy[assessmentType];
  return (
    <header className="space-y-5 border-b border-border pb-6">
      {onCancel ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-0 text-muted-foreground"
        >
          <IconArrowLeft className="size-4" /> Back to library
        </Button>
      ) : (
        <Link
          href="/post-task"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" /> Assessments
        </Link>
      )}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {copy.title}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <Button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="h-11 shrink-0 rounded-lg px-5"
        >
          {isSubmitting ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconPlus className="size-4" />
          )}
          {isSubmitting ? "Creating…" : "Create assessment"}
        </Button>
      </div>
    </header>
  );
}
