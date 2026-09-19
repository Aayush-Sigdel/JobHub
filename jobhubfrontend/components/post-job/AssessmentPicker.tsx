"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import { useQuery } from "@tanstack/react-query";
import {
  IconPalette,
  IconCode,
  IconDatabase,
  IconPlus,
  IconSearch,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJobTaskOptionsAction } from "@/lib/actions/recruiter";
import type { TaskLibraryOption } from "@/types/api/tasks";
import { cn } from "@/lib/utils";

const loadingBuilder = () => (
  <p role="status" className="p-6 text-sm text-muted-foreground">
    Loading assessment editor…
  </p>
);
const CssTaskForm = dynamic(
  () => import("@/components/task/post/CssTaskForm"),
  { loading: loadingBuilder },
);
const ProgrammingTaskForm = dynamic(
  () => import("@/components/task/post/ProgrammingTaskForm"),
  { loading: loadingBuilder },
);
const SqlTaskForm = dynamic(
  () => import("@/components/task/post/SqlTaskForm"),
  { loading: loadingBuilder },
);

type Selection = {
  designTaskId: string;
  programmingTaskId: string;
  sqlTaskId: string;
};
type Library = {
  designTasks: TaskLibraryOption[];
  programmingTasks: TaskLibraryOption[];
  sqlTasks: TaskLibraryOption[];
};
const categories = [
  {
    key: "designTaskId",
    source: "designTasks",
    label: "Design",
    icon: IconPalette,
  },
  {
    key: "programmingTaskId",
    source: "programmingTasks",
    label: "Programming",
    icon: IconCode,
  },
  {
    key: "sqlTaskId",
    source: "sqlTasks",
    label: "SQL",
    icon: IconDatabase,
  },
] as const;

export default function AssessmentPicker({
  value,
  onChange,
  library,
  disabled,
}: {
  value: Selection;
  onChange: (value: Selection) => void;
  library: Library;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingPending, setCreatingPending] = useState(false);
  const [created, setCreated] = useState<Library>({
    designTasks: [],
    programmingTasks: [],
    sqlTasks: [],
  });
  const [draft, setDraft] = useState(value);
  const [category, setCategory] = useState<0 | 1 | 2>(0);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("all");
  const query = useQuery({
    queryKey: ["recruiter", "assessment-library"],
    queryFn: getJobTaskOptionsAction,
    enabled: open,
    staleTime: 0,
    retry: false,
  });
  const remote = query.data || library;
  const merge = (source: keyof Library) => [
    ...created[source],
    ...remote[source].filter(
      (task) => !created[source].some((local) => local.id === task.id),
    ),
  ];
  const options: Library = {
    designTasks: merge("designTasks"),
    programmingTasks: merge("programmingTasks"),
    sqlTasks: merge("sqlTasks"),
  };
  const TaskForm = [CssTaskForm, ProgrammingTaskForm, SqlTaskForm][category];
  const current = categories[category];
  const visible = options[current.source].filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) &&
      (scope === "all" ||
        (scope === "public" ? task.scope === "PUBLIC" : task.isOwned)),
  );
  const attached = categories.filter(({ key }) => Boolean(value[key]));
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Assessments</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Choose practical tasks from your library or the public collection.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="rounded-lg"
          onClick={() => {
            setDraft(value);
            setOpen(true);
          }}
        >
          <IconPlus className="size-4" />
          {attached.length ? "Manage assessments" : "Add assessments"}
        </Button>
      </div>
      {attached.length ? (
        <div className="mt-4 space-y-2">
          {attached.map(({ key, label, source, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/15 px-4 py-3"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {options[source].find((task) => task.id === value[key])
                    ?.title || `Attached ${label.toLowerCase()} assessment`}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={`Remove ${label.toLowerCase()} assessment`}
                onClick={() => onChange({ ...value, [key]: "" })}
              >
                <IconX className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
          No assessments attached. Candidates can apply with their profile.
        </div>
      )}
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (creatingPending) return;
          setOpen(nextOpen);
          if (!nextOpen) setCreating(false);
        }}
      >
        <DialogContent
          className={cn(
            "flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0",
            creating ? "sm:max-w-6xl" : "sm:max-w-xl",
          )}
          showCloseButton={!creatingPending}
          onEscapeKeyDown={(event) => {
            if (creatingPending) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (creating) event.preventDefault();
          }}
          onSubmit={(event) => event.stopPropagation()}
        >
          <DialogHeader
            className={
              creating ? "sr-only" : "border-b border-border p-5 pr-14"
            }
          >
            <DialogTitle className="text-lg font-semibold">
              {creating
                ? `Create ${current.label.toLowerCase()} assessment`
                : "Assessment library"}
            </DialogTitle>
            <DialogDescription>
              Attach up to one assessment of each type.
            </DialogDescription>
          </DialogHeader>
          {creating ? (
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <TaskForm
                onCancel={() => setCreating(false)}
                onPendingChange={setCreatingPending}
                onCreated={(task) => {
                  setCreated((previous) => ({
                    ...previous,
                    [current.source]: [
                      task,
                      ...previous[current.source].filter(
                        (item) => item.id !== task.id,
                      ),
                    ],
                  }));
                  setDraft((previous) => ({
                    ...previous,
                    [current.key]: task.id,
                  }));
                  setSearch("");
                  setScope("all");
                  setCreating(false);
                  setCreatingPending(false);
                  void query.refetch();
                }}
              />
            </div>
          ) : (
            <>
              <div className="min-w-0 space-y-4 p-4 pb-4 sm:p-5">
                <div
                  role="group"
                  aria-label="Assessment type"
                  className="flex gap-4 border-b border-border"
                >
                  {categories.map(({ label, icon: Icon }, index) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={category === index}
                      onClick={() => setCategory(index as 0 | 1 | 2)}
                      className={cn(
                        "flex min-h-10 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        category === index
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-0 flex-1">
                    <IconSearch className="absolute top-3 left-3 size-4 text-muted-foreground" />
                    <Input
                      aria-label="Search assessments"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search assessments"
                      className="h-10 rounded-lg border border-border bg-background pl-9"
                    />
                  </div>
                  <select
                    aria-label="Assessment visibility"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-xs"
                  >
                    <option value="all">All assessments</option>
                    <option value="public">Public assessments</option>
                    <option value="mine">My assessments</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setCreating(true)}
                  >
                    <IconPlus className="size-3.5" />
                    Create new {current.label.toLowerCase()}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={query.isFetching}
                    onClick={() => query.refetch()}
                  >
                    <IconRefresh className="size-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="min-h-40 min-w-0 overflow-y-auto px-4 pb-5 sm:px-5">
                {query.isPending ? (
                  <p
                    role="status"
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading assessments…
                  </p>
                ) : query.isError || query.data?.error ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-border p-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      The assessment library could not be fully loaded.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => query.refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : visible.length ? (
                  <div className="divide-y divide-border">
                    {visible.map((task) => (
                      <label
                        key={task.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 px-2 py-4 transition-colors hover:bg-muted/25",
                          draft[current.key] === task.id
                            ? "bg-muted/30"
                            : "bg-background",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 size-4 shrink-0 accent-foreground"
                          checked={draft[current.key] === task.id}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              [current.key]: e.target.checked ? task.id : "",
                            })
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block break-words text-sm font-medium [overflow-wrap:anywhere]">
                            {task.title}
                          </span>
                          <span className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {task.scope === "PUBLIC" ? "Public" : "Private"}
                            </span>
                            {task.isOwned && <span>Created by you</span>}
                            {task.skillLevel && (
                              <span className="capitalize">
                                {task.skillLevel.toLowerCase()}
                              </span>
                            )}
                          </span>
                          {task.instructions && (
                            <div className="mt-2 max-h-10 max-w-full overflow-hidden [overflow-wrap:anywhere]">
                              <JobMarkdown
                                compact
                                className="line-clamp-2 text-xs leading-5"
                              >
                                {task.instructions}
                              </JobMarkdown>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No assessments match your search. Try another filter or
                    create a new one.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
                <span className="text-xs text-muted-foreground">
                  {Object.values(draft).filter(Boolean).length} assessments
                  selected
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={
                      query.isPending ||
                      query.isError ||
                      Boolean(query.data?.error) ||
                      disabled
                    }
                    onClick={() => {
                      onChange(draft);
                      setOpen(false);
                    }}
                  >
                    Apply selection
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
