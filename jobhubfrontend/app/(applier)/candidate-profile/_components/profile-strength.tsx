"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { syncAllEmbeddingsAction } from "@/lib/actions/embeddings";
import { Button } from "@/components/ui/button";

interface MatchProfileData {
  title?: string;
  bio?: string;
  location?: string;
  skills?: { name: string }[];
  experiences?: unknown[];
  educations?: unknown[];
  socialLinks?: { platform: string; url: string }[];
}

interface ReadinessItem {
  label: string;
  complete: boolean;
}

const embeddableSocialPlatforms = new Set([
  "GITHUB",
  "DEV_TO",
  "ORCID",
  "STACKOVERFLOW",
]);

export function ProfileStrength({ profile }: { profile: MatchProfileData }) {
  const [isPending, startTransition] = useTransition();
  const socialLinks = profile.socialLinks ?? [];
  const matchingSources = socialLinks.filter((link) =>
    embeddableSocialPlatforms.has(link.platform.toUpperCase()),
  );
  const hasLinkedIn = socialLinks.some(
    (link) => link.platform.toUpperCase() === "LINKEDIN",
  );
  const readinessItems: ReadinessItem[] = [
    { label: "Professional title", complete: Boolean(profile.title?.trim()) },
    { label: "About summary", complete: Boolean(profile.bio?.trim()) },
    { label: "At least 3 skills", complete: (profile.skills?.length ?? 0) >= 3 },
    { label: "Work experience", complete: (profile.experiences?.length ?? 0) > 0 },
    { label: "Education", complete: (profile.educations?.length ?? 0) > 0 },
    { label: "Location", complete: Boolean(profile.location?.trim()) },
    { label: "Matching data source", complete: matchingSources.length > 0 },
  ];
  const completedItems = readinessItems.filter((item) => item.complete).length;

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const result = await syncAllEmbeddingsAction();
        if (result.profileEmbeddingUpdated) {
          toast.success("Matching data refreshed.");
        } else {
          toast.error("Your profile was saved, but matching data could not be fully refreshed.");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to refresh matching data.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Matching data
            </p>
            <h2 className="mt-1 text-lg font-bold">Evidence checklist</h2>
          </div>
          <span className="text-sm font-semibold tabular-nums">{completedItems} of {readinessItems.length}</span>
        </div>

        <div className="mt-5 space-y-2.5">
          {readinessItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.complete ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/50" />
              )}
              <span className={item.complete ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={`mr-2 size-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Refreshing…" : "Refresh matching data"}
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-bold">Matching evidence</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Job relevance uses JobHub platform data, GitHub, Dev.to, Stack Overflow, and ORCID.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium">
            JobHub platform
          </span>
          {matchingSources.map((source) => (
            <span
              key={`${source.platform}-${source.url}`}
              className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium capitalize"
            >
              {source.platform.replaceAll("_", " ").toLowerCase()}
            </span>
          ))}
        </div>

        {hasLinkedIn && (
          <p className="mt-4 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
            LinkedIn remains visible on your profile, but it is not included in job matching.
          </p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Portfolio, website, and other profile links remain available to recruiters without affecting similarity.
        </p>
      </section>

      <nav className="rounded-2xl border border-border bg-card p-3 shadow-sm" aria-label="Candidate shortcuts">
        <Link
          href="/job-tracker"
          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-2"><BriefcaseBusiness className="size-4" /> My applications</span>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
        <Link
          href="/find-job"
          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-2"><Search className="size-4" /> Find matching jobs</span>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
      </nav>
    </div>
  );
}
