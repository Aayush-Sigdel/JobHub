"use client";

import { useEffect, useState } from "react";
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
  IconScan,
  IconLoader2,
  IconExternalLink,
} from "@tabler/icons-react";
import type { CandidateSocialSnapshotDto } from "@/types/api/recruiter";
import type { SocialLinkDto } from "@/types/api/user";
import {
  limitedSnapshotNotes,
  SNAPSHOT_SUMMARY_LIMIT,
} from "@/lib/snapshot-replay";
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

function analysisDurationMs(platform: string, updatedAt?: string) {
  const seed = `${platform}:${updatedAt || "saved"}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return 5_000 + (Math.abs(hash) % 3_001);
}

function fieldLabel(key: string) {
  const labels: Record<string, string> = {
    repoCount: "Repositories",
    articleCount: "Articles",
    worksCount: "Publications",
    linkCount: "Links",
    topTags: "Top topics",
    topRepositories: "Top repositories",
    topArticles: "Top articles",
    topAnswers: "Top answers",
    topPublications: "Top publications",
    topSections: "Top sections",
    languages: "Primary languages",
    keywords: "Research keywords",
  };
  return (
    labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ")
  );
}

function EvidenceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">Not available</span>;
  if (Array.isArray(value)) {
    const visible = value.slice(0, SNAPSHOT_SUMMARY_LIMIT);
    const hiddenCount = Math.max(0, value.length - visible.length);
    return value.length ? (
      <>
        <div className="flex flex-wrap gap-1.5">
          {visible.map((item, index) => (
            <div key={index} className="rounded-md bg-muted px-2 py-1 text-xs">
              <EvidenceValue value={item} />
            </div>
          ))}
        </div>
        {hiddenCount > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            +{hiddenCount} more included in the analysis
          </p>
        )}
      </>
    ) : (
      <span className="text-muted-foreground">None recorded</span>
    );
  }
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
  sourceUrl,
}: {
  snapshot: CandidateSocialSnapshotDto;
  match: SimilarityEvidence;
  sourceUrl?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [visibleNoteCount, setVisibleNoteCount] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
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
  const limitedNotes = limitedSnapshotNotes(snapshot);
  const notes = limitedNotes.notes.map(sourceObservation);
  const noteCount = notes.length;
  const displayedNoteCount = reducedMotion ? notes.length : visibleNoteCount;
  const isComplete = Boolean(reducedMotion) || analysisComplete;

  useEffect(() => {
    if (reducedMotion) return;

    const duration = analysisDurationMs(snapshot.platform, snapshot.updatedAt);
    const timers: ReturnType<typeof setTimeout>[] = [];
    Array.from({ length: noteCount }).forEach((_, index) => {
      const revealAt = Math.min(
        duration - 450,
        350 + ((index + 1) * (duration - 900)) / Math.max(noteCount, 1),
      );
      timers.push(setTimeout(() => setVisibleNoteCount(index + 1), revealAt));
    });
    timers.push(setTimeout(() => setAnalysisComplete(true), duration));

    return () => timers.forEach(clearTimeout);
  }, [noteCount, reducedMotion, snapshot.platform, snapshot.updatedAt]);

  return (
    <article className="overflow-hidden border-t border-border/70">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h4 className="flex items-center gap-2.5 text-sm font-semibold">
            <Icon className="size-5 text-muted-foreground" />
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center gap-1.5 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="truncate">{platform.label}</span>
                <IconExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              platform.label
            )}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {snapshot.updatedAt ? (
              <>
                Snapshot updated{" "}
                <time dateTime={snapshot.updatedAt}>
                  {reviewDate(snapshot.updatedAt)}
                </time>
              </>
            ) : (
              "Saved profile evidence"
            )}
          </p>
        </div>
        <p
          role="status"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          {isComplete ? (
            <>
              <IconCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              Analysis ready
            </>
          ) : (
            <>
              <IconLoader2 className="size-4 motion-safe:animate-spin" />
              Analyzing evidence
            </>
          )}
        </p>
      </header>
      <div className="p-5">
        {!isComplete ? (
          <div
            className="rounded-lg border border-border/70 bg-muted/15 p-4"
            aria-live="polite"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <IconScan className="size-4 text-muted-foreground" />
                Processing {platform.label}
              </p>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {displayedNoteCount} of {notes.length || 1} checks
              </span>
            </div>
            {displayedNoteCount === 0 ? (
              <div className="flex items-center gap-3 rounded-lg bg-background/70 px-3 py-3">
                <span className="size-2 rounded-full bg-muted-foreground/40 motion-safe:animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Connecting to the saved source snapshot…
                </p>
              </div>
            ) : (
              <ol
                aria-label={`${platform.label} analysis steps`}
                className="space-y-2"
              >
                {notes
                  .slice(0, displayedNoteCount)
                  .map(({ label, text }, index) => (
                    <motion.li
                      key={`${label}-${text}-${index}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3 rounded-lg bg-background/70 px-3 py-2.5"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                        <IconFileText className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-medium text-muted-foreground">
                          {label}
                        </span>
                        <span className="mt-0.5 block truncate text-sm">
                          {text}
                        </span>
                      </span>
                    </motion.li>
                  ))}
              </ol>
            )}
            <p className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <IconLoader2 className="size-3.5 motion-safe:animate-spin" />
              Comparing source signals with this job
            </p>
          </div>
        ) : fields.length > 0 ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.35 }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <IconCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Evidence summary
              </p>
              {limitedNotes.hiddenCount > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {limitedNotes.hiddenCount} more signals included
                </p>
              )}
            </div>
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
        ) : (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            No profile evidence was included in this snapshot.
          </motion.p>
        )}
      </div>
      {isComplete && (score !== null || contribution) && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.35, delay: 0.08 }}
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
    </article>
  );
}

export default function CandidateEvidenceReport({
  snapshots,
  match,
  socialLinks = [],
}: {
  snapshots: CandidateSocialSnapshotDto[];
  match: SimilarityEvidence;
  socialLinks?: SocialLinkDto[];
}) {
  const normalizedPlatform = (value: string) =>
    value.toUpperCase().replaceAll("_", "").replaceAll(".", "");

  return (
    <div aria-label="Match details by source">
      {snapshots.map((snapshot, index) => {
        const sourceUrl = socialLinks.find(
          (link) =>
            normalizedPlatform(link.platform) ===
            normalizedPlatform(snapshot.platform),
        )?.url;
        return (
          <SourceEvidence
            key={`${snapshot.platform}-${index}`}
            snapshot={snapshot}
            match={match}
            sourceUrl={sourceUrl}
          />
        );
      })}
    </div>
  );
}
