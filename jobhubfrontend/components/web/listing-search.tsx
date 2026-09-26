"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CornerDownLeft,
  FolderKanban,
  Loader2,
  Search,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Hint } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { searchApplicantListings } from "@/lib/actions/search";
import { cn } from "@/lib/utils";

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-primary/30 text-foreground">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function ListingSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const router = useRouter();
  const { data: session, status } = useSession();
  const term = query.trim();
  function changeOpen(value: boolean) {
    setOpen(value);
    if (!value) {
      setQuery("");
      setDebounced("");
      setActive(-1);
    }
  }
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(term), 250);
    return () => window.clearTimeout(timeout);
  }, [term]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) inputRef.current?.focus();
        else setOpen(true);
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [open]);
  const results = useQuery({
    queryKey: ["applicant-search", session?.user?.id, debounced],
    queryFn: () => searchApplicantListings(debounced),
    enabled: open && status === "authenticated" && !session?.user?.employer,
    staleTime: 30_000,
    retry: false,
  });
  const searching = term !== debounced || results.isPending;
  const groups =
    !searching && results.data
      ? [
          {
            key: "jobs",
            title: term ? "Jobs" : "Latest jobs",
            icon: BriefcaseBusiness,
            href: term
              ? `/find-job?query=${encodeURIComponent(term)}&sortBy=date`
              : "/find-job?sortBy=date",
            ...results.data.jobs,
          },
          {
            key: "projects",
            title: term ? "Projects" : "Latest projects",
            icon: FolderKanban,
            href: term
              ? `/collaborators/explore?query=${encodeURIComponent(term)}`
              : "/collaborators/explore",
            ...results.data.projects,
          },
        ]
      : [];
  const items = groups.flatMap((group) => group.items);
  const selected = items.length
    ? active >= 0 && active < items.length
      ? active
      : 0
    : -1;
  useEffect(() => {
    if (selected >= 0)
      listRef.current
        ?.querySelector(`[data-result-index="${selected}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <Hint content="Search jobs and projects · Ctrl / ⌘ K">
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Search jobs and projects"
            aria-keyshortcuts="Control+k Meta+k"
            className="flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring sm:w-full sm:justify-start sm:px-3"
          >
            <Search className="size-4 shrink-0" />
            <span className="hidden truncate text-xs sm:block">
              Search jobs & projects
            </span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-background px-1 text-[10px] xl:block">
              ⌘ / Ctrl K
            </kbd>
          </button>
        </PopoverTrigger>
      </Hint>
      <PopoverContent
        align="center"
        sideOffset={12}
        className="w-[520px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border p-0 shadow-xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
        aria-label="Search jobs and projects"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          {searching ? (
            <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-5 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Search jobs and projects"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={
              selected >= 0 ? `${listId}-${selected}` : undefined
            }
            autoComplete="off"
            maxLength={120}
            placeholder="Search jobs and projects…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!event.target.value.trim()) setDebounced("");
              setActive(-1);
            }}
            className="h-8 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                if (items.length)
                  setActive(
                    event.key === "ArrowDown"
                      ? (selected + 1) % items.length
                      : selected <= 0
                        ? items.length - 1
                        : selected - 1,
                  );
              }
              if (event.key === "Enter" && selected >= 0) {
                event.preventDefault();
                router.push(items[selected].href);
                changeOpen(false);
              }
            }}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => {
                setQuery("");
                setDebounced("");
                setActive(-1);
                inputRef.current?.focus();
              }}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <p role="status" className="sr-only">
          {!searching && results.data ? `${items.length} results shown` : ""}
        </p>
        <div
          ref={listRef}
          className="max-h-[min(60dvh,480px)] overflow-y-auto p-2"
        >
          {searching ? (
            <p
              role="status"
              className="py-10 text-center text-sm text-muted-foreground"
            >
              {term ? "Searching…" : "Loading listings…"}
            </p>
          ) : results.error ? (
            <div role="alert" className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Search couldn’t be loaded.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => results.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : null}
          <div
            id={listId}
            role="listbox"
            aria-label="Search results"
            aria-busy={searching}
          >
            {groups.map((group) => (
              <div
                key={group.key}
                role="group"
                aria-label={group.title}
                className="mb-2 last:mb-0"
              >
                <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                  <h3 className="font-semibold">{group.title}</h3>
                  {group.total > 0 && (
                    <Link
                      href={group.href}
                      onClick={() => changeOpen(false)}
                      className="hover:text-foreground hover:underline"
                    >
                      View all ({group.total})
                    </Link>
                  )}
                </div>
                {group.error ? (
                  <div
                    role="alert"
                    className="flex items-center justify-between gap-2 px-3 py-4"
                  >
                    <span className="text-sm text-muted-foreground">
                      {group.error}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => results.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : group.items.length ? (
                  group.items.map((item) => {
                    const index = items.indexOf(item);
                    const Icon = group.icon;
                    return (
                      <div
                        key={item.id}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={selected === index}
                        data-result-index={index}
                      >
                        <Link
                          href={item.href}
                          tabIndex={-1}
                          onPointerMove={() => setActive(index)}
                          onClick={() => changeOpen(false)}
                          className={cn(
                            "flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                            selected === index
                              ? "bg-muted"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <span className="rounded-lg border border-border bg-background p-2">
                            <Icon className="size-4 text-muted-foreground" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              <Highlight text={item.title} query={term} />
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              <Highlight text={item.subtitle} query={term} />
                            </span>
                          </span>
                          {selected === index && (
                            <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <p className="px-3 py-5 text-sm text-muted-foreground">
                    No {group.key} found.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="size-3" />
            <ArrowDown className="size-3" />
            Navigate
            <span className="ml-3 flex items-center gap-1">
              <CornerDownLeft className="size-3" />
              Open
            </span>
          </span>
          <button
            type="button"
            onClick={() => changeOpen(false)}
            className="rounded px-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Esc · Close
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
