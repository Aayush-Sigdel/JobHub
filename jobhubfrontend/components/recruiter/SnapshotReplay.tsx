"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconRotateClockwise,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import type { CandidateSocialSnapshotDto } from "@/types/api/recruiter";
import { snapshotReplayEvents } from "@/lib/snapshot-replay";
import { reviewDate } from "./candidate-review-utils";

const platformNames: Record<string, string> = {
  GITHUB: "GitHub",
  DEV_TO: "Dev.to",
  STACKOVERFLOW: "Stack Overflow",
  ORCID: "ORCID",
  PORTFOLIO: "Portfolio",
  WEBSITE: "Website",
};

export default function SnapshotReplay({
  snapshots,
}: {
  snapshots: CandidateSocialSnapshotDto[];
}) {
  const events = useMemo(() => snapshotReplayEvents(snapshots), [snapshots]);
  const reducedMotion = useReducedMotion() ?? true;
  const [progress, setProgress] = useState({ event: 0, chars: 0 });
  const [paused, setPaused] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const complete = reducedMotion || progress.event >= events.length;
  const playing = !complete && !paused;
  const active = events[progress.event];
  const shown = complete ? events : events.slice(0, progress.event + 1);

  useEffect(() => {
    if (!playing || !active) return;
    const timer = setTimeout(
      () => {
        setProgress((current) =>
          current.chars >= active.text.length
            ? { event: current.event + 1, chars: 0 }
            : {
                ...current,
                chars: Math.min(
                  active.text.length,
                  current.chars +
                    Math.max(3, Math.ceil(active.text.length / 12)),
                ),
              },
        );
      },
      progress.chars >= active.text.length ? 150 : 45,
    );
    return () => clearTimeout(timer);
  }, [active, playing, progress.chars]);

  useEffect(() => {
    const element = feed.current;
    if (element && follow.current) element.scrollTop = element.scrollHeight;
  }, [progress]);

  function replay() {
    follow.current = true;
    setPaused(false);
    setProgress({ event: 0, chars: 0 });
    if (feed.current) feed.current.scrollTop = 0;
  }

  const control =
    "inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground";
  return (
    <section
      aria-label="Snapshot evidence replay"
      className="overflow-hidden rounded-xl border border-border"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/25 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <IconSparkles className="size-4" />
          <h4 className="text-sm font-semibold">Evidence walkthrough</h4>
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            Snapshot replay
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!reducedMotion &&
            (complete ? (
              <button type="button" className={control} onClick={replay}>
                <IconRotateClockwise className="size-3.5" />
                Replay
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={control}
                  onClick={() => setPaused((value) => !value)}
                >
                  {paused ? (
                    <IconPlayerPlay className="size-3.5" />
                  ) : (
                    <IconPlayerPause className="size-3.5" />
                  )}
                  {paused ? "Continue" : "Pause"}
                </button>
                <button
                  type="button"
                  className={control}
                  onClick={() =>
                    setProgress({ event: events.length, chars: 0 })
                  }
                >
                  Show all
                </button>
              </>
            ))}
          <button
            type="button"
            className={control}
            aria-pressed={showJson}
            onClick={() => setShowJson((value) => !value)}
          >
            {showJson ? "Timeline" : "Source JSON"}
          </button>
        </div>
      </div>
      <div className="border-b border-border/60 px-4 py-3 sm:px-5">
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          {playing ? (
            <IconLoader2 className="size-3.5 motion-safe:animate-spin" />
          ) : (
            <IconCheck className="size-3.5" />
          )}
          {complete
            ? `All ${snapshots.length} snapshots displayed`
            : paused
              ? "Replay paused"
              : `Reading saved ${platformNames[active?.platform] || active?.platform || "source"} evidence…`}
          <span className="ml-auto tabular-nums">
            {complete ? events.length : progress.event}/{events.length} entries
          </span>
        </p>
      </div>
      {showJson ? (
        <pre
          tabIndex={0}
          className="max-h-[32rem] overflow-auto p-4 text-xs leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground sm:p-5"
        >
          {JSON.stringify(snapshots, null, 2)}
        </pre>
      ) : (
        <div
          ref={feed}
          onScroll={(event) => {
            const element = event.currentTarget;
            follow.current =
              element.scrollHeight - element.clientHeight - element.scrollTop <
              48;
          }}
          className="max-h-[32rem] overflow-auto p-4 sm:p-5"
        >
          <ol className="space-y-4" aria-live="off">
            {shown.map((event, index) => {
              const isActive = !complete && index === progress.event;
              const text = isActive
                ? event.text.slice(0, progress.chars)
                : event.text;
              return (
                <li
                  key={index}
                  className={
                    event.kind === "source"
                      ? "border-t border-border/60 pt-4 first:border-0 first:pt-0"
                      : "ml-2 border-l border-border pl-5"
                  }
                >
                  {event.kind === "source" ? (
                    <div>
                      <h5 className="text-sm font-semibold">
                        {platformNames[event.platform] || event.platform}
                      </h5>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated {reviewDate(event.updatedAt)}
                        {event.updatedAt && (
                          <time dateTime={event.updatedAt} className="ml-2">
                            {!Number.isNaN(Date.parse(event.updatedAt))
                              ? new Date(event.updatedAt).toLocaleTimeString(
                                  undefined,
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : ""}
                          </time>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      {isActive ? (
                        <IconLoader2 className="mt-1 size-3.5 shrink-0 text-muted-foreground motion-safe:animate-spin" />
                      ) : (
                        <IconCheck className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <p
                        className={`min-w-0 whitespace-pre-wrap break-words text-sm leading-6 ${event.kind === "summary" ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {text}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="ml-0.5 inline-block h-3.5 w-1.5 bg-foreground align-middle motion-safe:animate-pulse"
                          />
                        )}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
