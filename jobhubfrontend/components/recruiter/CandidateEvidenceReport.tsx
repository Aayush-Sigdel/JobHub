"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  IconBrandGithub,
  IconBrandStackoverflow,
  IconArticle,
  IconWorld,
  IconSchool,
  IconExternalLink,
  IconChevronDown,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import type { CandidateSocialSnapshotDto } from "@/types/api/recruiter";
import type { SocialLinkDto } from "@/types/api/user";
import { SNAPSHOT_SUMMARY_LIMIT } from "@/lib/snapshot-replay";
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
        <ul className="space-y-2">
          {visible.map((item, index) => (
            <li key={index} className="text-sm leading-6">
              <EvidenceValue value={item} />
            </li>
          ))}
        </ul>
        {hiddenCount > 0 && (
          <details className="mt-2">
            <summary className="min-h-9 cursor-pointer text-sm underline underline-offset-4">
              Show {hiddenCount} more
            </summary>
            <ul className="mt-2 space-y-2">
              {value.slice(visible.length).map((item, index) => (
                <li key={index}>
                  <EvidenceValue value={item} />
                </li>
              ))}
            </ul>
          </details>
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
  initiallyOpen,
}: {
  snapshot: CandidateSocialSnapshotDto;
  match: SimilarityEvidence;
  sourceUrl?: string;
  initiallyOpen: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [visibleNoteCount, setVisibleNoteCount] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const isComplete = Boolean(reducedMotion) || analysisComplete;
  const platform = platforms[snapshot.platform] || {
    label: snapshot.platform,
    icon: IconWorld,
  };
  const Icon = platform.icon;
  const key = sourceKeys[snapshot.platform];
  const rawScore = key ? match[key] : undefined;
  const score =
    typeof rawScore === "number" && Number.isFinite(rawScore)
      ? clampSimilarity(rawScore)
      : null;
  const contributes = getSimilarityContributions(match).some(
    (source) => source.key === key,
  );
  const fields = Object.entries(snapshot.summary ?? {});
  const notes = (snapshot.aiCoolFeedItems ?? [])
    .filter((note) => typeof note === "string" && note.trim())
    .map(sourceObservation);
  const href = safeSourceUrl(sourceUrl);
  const replayNotes = notes.slice(0, 10);
  const noteCount = replayNotes.length;

  useEffect(() => {
    if (!isOpen || reducedMotion || analysisComplete) return;
    const duration = analysisDurationMs(snapshot.platform, snapshot.updatedAt);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let index = 0; index < noteCount; index++) {
      const revealAt = Math.min(
        duration - 450,
        350 + ((index + 1) * (duration - 900)) / Math.max(noteCount, 1),
      );
      timers.push(
        setTimeout(
          () =>
            setVisibleNoteCount((previous) => Math.max(previous, index + 1)),
          revealAt,
        ),
      );
    }
    timers.push(setTimeout(() => setAnalysisComplete(true), duration));
    return () => timers.forEach(clearTimeout);
  }, [
    isOpen,
    reducedMotion,
    analysisComplete,
    noteCount,
    snapshot.platform,
    snapshot.updatedAt,
  ]);

  return (
    <details
      open={isOpen}
      onToggle={(event) => {
        if (event.target === event.currentTarget)
          setIsOpen(event.currentTarget.open);
      }}
      className="group min-w-0 border-t border-border py-5"
    >
      <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 py-2 [&::-webkit-details-marker]:hidden">
        <Icon
          aria-hidden="true"
          className="size-5 shrink-0 text-muted-foreground"
        />
        <span className="text-base font-semibold">{platform.label}</span>
        {score !== null && (
          <span className="text-sm tabular-nums text-muted-foreground">
            {Math.round(score * 100)}% match
            {!contributes && " · separate from overall score"}
          </span>
        )}
        <IconChevronDown
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 group-open:rotate-180"
        />
      </summary>
      <div
        ref={evidenceRef}
        tabIndex={-1}
        aria-label={`${platform.label} evidence`}
        className="space-y-6 pt-3"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <p>
            {snapshot.updatedAt
              ? `Saved ${reviewDate(snapshot.updatedAt)}`
              : "Saved profile evidence"}
          </p>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 text-foreground underline decoration-foreground/30 underline-offset-4"
            >
              Open {platform.label}
              <IconExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          {isComplete ? (
            <IconCheck aria-hidden="true" className="size-4" />
          ) : (
            <IconLoader2
              aria-hidden="true"
              className="size-4 motion-safe:animate-spin"
            />
          )}
          {isComplete ? "Evidence summary ready" : "Reviewing saved evidence…"}
        </p>
        {!isComplete ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {platform.label} source review
              </p>
              <button
                type="button"
                className="min-h-9 text-xs underline underline-offset-4"
                onClick={() => {
                  setAnalysisComplete(true);
                  requestAnimationFrame(() =>
                    evidenceRef.current?.focus({ preventScroll: true }),
                  );
                }}
              >
                Show summary now
              </button>
            </div>
            <div aria-hidden="true" className="h-1 overflow-hidden bg-muted">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration:
                    analysisDurationMs(snapshot.platform, snapshot.updatedAt) /
                    1000,
                  ease: "linear",
                }}
                className="h-full bg-primary"
              />
            </div>
            {visibleNoteCount === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">
                Opening the saved source snapshot…
              </p>
            ) : (
              <ol
                aria-label={`${platform.label} review steps`}
                className="space-y-4"
              >
                {replayNotes
                  .slice(0, visibleNoteCount)
                  .map(({ label, text }, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3"
                    >
                      <IconCheck
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-muted-foreground"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 break-words text-sm leading-6">
                          {text}
                        </p>
                      </div>
                    </motion.li>
                  ))}
              </ol>
            )}
          </div>
        ) : (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.35 }}
          >
            {fields.length ? (
              <dl className="grid min-w-0 gap-x-8 gap-y-5 sm:grid-cols-2">
                {fields.map(([key, value]) => (
                  <div
                    key={key}
                    className={
                      typeof value === "number"
                        ? "min-w-0"
                        : "min-w-0 sm:col-span-2"
                    }
                  >
                    <dt className="text-xs capitalize text-muted-foreground">
                      {fieldLabel(key)}
                    </dt>
                    <dd
                      className={`mt-2 ${typeof value === "number" ? "text-xl font-semibold tabular-nums" : "text-sm leading-6"}`}
                    >
                      <EvidenceValue value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No profile summary was included in this saved source.
              </p>
            )}
          </motion.div>
        )}
        {isComplete && notes.length > 0 && (
          <details>
            <summary className="min-h-11 cursor-pointer text-sm font-medium">
              Source observations ({notes.length})
            </summary>
            <ol className="mt-3 space-y-4">
              {notes.map(({ label, text }, index) => (
                <li key={index}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words text-sm leading-6">{text}</p>
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </details>
  );
}

function safeSourceUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
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
    <section aria-label="Saved source evidence" className="min-w-0 space-y-2">
      <h3 className="text-lg font-semibold">Profile evidence</h3>
      <p className="text-sm text-muted-foreground">
        Saved information from the candidate’s connected profiles.
      </p>
      {snapshots.map((snapshot, index) => (
        <SourceEvidence
          key={`${snapshot.platform}-${snapshot.updatedAt}-${index}`}
          snapshot={snapshot}
          match={match}
          initiallyOpen={index === 0}
          sourceUrl={
            socialLinks.find(
              (link) =>
                normalizedPlatform(link.platform) ===
                normalizedPlatform(snapshot.platform),
            )?.url
          }
        />
      ))}
    </section>
  );
}
