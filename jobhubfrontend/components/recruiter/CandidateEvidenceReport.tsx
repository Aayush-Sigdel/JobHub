"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  IconBrandGithub,
  IconBrandStackoverflow,
  IconArticle,
  IconWorld,
  IconSchool,
  IconFileText,
  IconCheck,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { CandidateSocialSnapshotDto } from "@/types/api/recruiter";
import {
  clampSimilarity,
  getSimilarityContributions,
  type SimilarityEvidence,
} from "@/lib/semantic-match";
import { reviewDate } from "./candidate-review-utils";

const sourceKeys: Record<string, keyof SimilarityEvidence> = {
  GITHUB: "githubSimilarity",
  DEV_TO: "devtoSimilarity",
  STACKOVERFLOW: "stackoverflowSimilarity",
  ORCID: "orcidSimilarity",
  PORTFOLIO: "portfolioSimilarity",
  WEBSITE: "portfolioSimilarity",
};

const platforms: Record<string, { label: string; icon: typeof IconWorld }> = {
  GITHUB: { label: "GitHub", icon: IconBrandGithub },
  DEV_TO: { label: "Dev.to", icon: IconArticle },
  STACKOVERFLOW: { label: "Stack Overflow", icon: IconBrandStackoverflow },
  ORCID: { label: "ORCID", icon: IconSchool },
  PORTFOLIO: { label: "Portfolio", icon: IconWorld },
  WEBSITE: { label: "Website", icon: IconWorld },
};

function fieldLabel(key: string) {
  const labels: Record<string, string> = {
    repoCount: "Repositories",
    articleCount: "Articles",
    worksCount: "Publications",
    linkCount: "Links",
    topTags: "Top topics",
  };
  return (
    labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ")
  );
}

function EvidenceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">Not available</span>;
  if (Array.isArray(value))
    return value.length ? (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, index) => (
          <div key={index} className="rounded-md bg-muted px-2 py-1 text-xs">
            <EvidenceValue value={item} />
          </div>
        ))}
      </div>
    ) : (
      <span className="text-muted-foreground">None recorded</span>
    );
  if (typeof value === "object")
    return (
      <dl className="space-y-2">
        {Object.entries(value).map(([key, item]) => (
          <div key={key}>
            <dt className="text-xs capitalize text-muted-foreground">
              {fieldLabel(key)}
            </dt>
            <dd className="mt-1">
              <EvidenceValue value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return (
    <span className="whitespace-pre-wrap break-words">
      {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
    </span>
  );
}

function sourceObservation(note: string) {
  const patterns: [RegExp, string][] = [
    [/^(?:Processing portfolio|Portfolio):\s*/i, "Page title"],
    [/^(?:Analyzed section|Section):\s*/i, "Page section"],
    [/^(?:Processing repo|Repository):\s*/i, "Repository"],
    [/^(?:Processing Dev.to article|Article):\s*/i, "Article"],
    [/^(?:Processing top answer|Answer):\s*/i, "Answer"],
    [/^(?:Processing ORCID publication|Publication):\s*/i, "Publication"],
    [/^(?:Extracted primary languages|Primary languages):\s*/i, "Languages"],
    [/^Analyzed StackOverflow tags:\s*/i, "Topics"],
    [/^Identified research domains:\s*/i, "Research domains"],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(note)) return { label, text: note.replace(pattern, "") };
  }
  return { label: "Observation", text: note };
}

function SourceEvidence({
  snapshot,
  match,
}: {
  snapshot: CandidateSocialSnapshotDto;
  match: SimilarityEvidence;
}) {
  const reducedMotion = useReducedMotion();
  const platform = platforms[snapshot.platform] || {
    label: snapshot.platform,
    icon: IconWorld,
  };
  const Icon = platform.icon;
  const sourceKey = sourceKeys[snapshot.platform];
  const rawScore = sourceKey ? match[sourceKey] : undefined;
  const score =
    typeof rawScore === "number" && Number.isFinite(rawScore)
      ? clampSimilarity(rawScore)
      : null;
  const contribution = getSimilarityContributions(match).find(
    (source) => source.key === sourceKey,
  );
  const fields = Object.entries(snapshot.summary ?? {});
  const notes = (snapshot.aiCoolFeedItems ?? [])
    .filter((note) => typeof note === "string" && note.trim())
    .map(sourceObservation);
  // Keep even long snapshots under four seconds, without changing the saved data.
  const interval = Math.min(0.48, 3.2 / Math.max(notes.length, 1));
  const summaryDelay = notes.length ? 0.2 + notes.length * interval : 0;
  const reveal = (delay: number) => ({
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.35,
        delay: reducedMotion ? 0 : delay,
      },
    },
  });

  return (
    <motion.article
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
      className="overflow-hidden border-t border-border/70"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <div>
          <h4 className="flex items-center gap-2.5 text-sm font-semibold">
            <Icon className="size-5 text-muted-foreground" />
            {platform.label}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          {snapshot.updatedAt ? (
            <>
              Updated{" "}
              <time dateTime={snapshot.updatedAt}>
                {reviewDate(snapshot.updatedAt)}
              </time>
            </>
          ) : (
            "Update date unavailable"
          )}
        </p>
      </header>
      <div className="p-5">
        {notes.length > 0 && (
          <ol
            aria-label={`${platform.label} source observations`}
            className="space-y-0"
          >
            {notes.map(({ label, text }, index) => (
              <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
                {index < notes.length - 1 && (
                  <motion.span
                    aria-hidden="true"
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: {
                          delay: reducedMotion ? 0 : 0.35 + index * interval,
                          duration: reducedMotion ? 0 : interval,
                        },
                      },
                    }}
                    className="absolute top-7 bottom-0 left-3.5 w-px origin-top bg-border"
                  />
                )}
                <motion.span
                  variants={reveal(0.15 + index * interval)}
                  aria-hidden="true"
                  className="relative z-[1] mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                >
                  <IconFileText className="size-3.5" />
                </motion.span>
                <motion.div
                  variants={reveal(0.2 + index * interval)}
                  className="relative min-w-0 flex-1 overflow-hidden rounded-lg px-3 py-2"
                >
                  {!reducedMotion && (
                    <motion.div
                      aria-hidden="true"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: [0, 1, 0],
                          transition: {
                            delay: 0.2 + index * interval,
                            duration: 0.8,
                          },
                        },
                      }}
                      className="pointer-events-none absolute inset-0 rounded-lg bg-primary/10"
                    />
                  )}
                  <p className="relative text-[11px] font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="relative mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                    {text}
                  </p>
                </motion.div>
              </li>
            ))}
          </ol>
        )}
        {fields.length > 0 && (
          <motion.div
            variants={reveal(summaryDelay)}
            className={
              notes.length ? "mt-5 border-t border-border/60 pt-5" : ""
            }
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <IconCheck className="size-3.5" />
              Snapshot summary
            </p>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {fields.map(([key, value]) => (
                <div
                  key={key}
                  className={typeof value === "number" ? "" : "sm:col-span-2"}
                >
                  <dt className="text-xs capitalize text-muted-foreground">
                    {key === "linkCount"
                      ? "Links in saved profile"
                      : fieldLabel(key)}
                  </dt>
                  <dd
                    className={`mt-2 ${typeof value === "number" ? "text-2xl font-semibold tabular-nums tracking-tight" : "text-sm"}`}
                  >
                    <EvidenceValue value={value} />
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
        {!fields.length && !notes.length && (
          <p className="text-sm text-muted-foreground">
            No profile evidence was included in this snapshot.
          </p>
        )}
      </div>
      {(score !== null || contribution) && (
        <motion.div
          variants={reveal(summaryDelay + 0.2)}
          className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3"
        >
          <div>
            <p className="text-xs text-muted-foreground">
              {platform.label} match
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {Math.round((score ?? 0) * 100)}%
            </p>
          </div>
          {contribution ? (
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-sm font-semibold tabular-nums">
                <IconArrowUpRight className="size-4" />
                {contribution.points.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}{" "}
                pts toward overall
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(contribution.normalizedWeight * 100).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 1 },
                )}
                % of the overall weighting
              </p>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Separate from overall score
            </span>
          )}
        </motion.div>
      )}
    </motion.article>
  );
}

export default function CandidateEvidenceReport({
  snapshots,
  match,
}: {
  snapshots: CandidateSocialSnapshotDto[];
  match: SimilarityEvidence;
}) {
  return (
    <div aria-label="Match details by source">
      {snapshots.map((snapshot, index) => (
        <SourceEvidence
          key={`${snapshot.platform}-${index}`}
          snapshot={snapshot}
          match={match}
        />
      ))}
    </div>
  );
}
