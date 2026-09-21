"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { membershipActions } from "@/lib/collaboration";
import { changeMembership } from "@/lib/actions/collaboration";
import { unwrap, useRefreshCollaboration } from "@/lib/hooks/use-collaboration";
import type {
  MatchExplanation,
  Membership,
  TeamMember,
} from "@/types/api/collaboration";
import { toast } from "sonner";

export const panelClass =
  "rounded-2xl border border-border bg-card p-5 shadow-xs";
export const selectClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${status === "DECLINED" || status === "CANCELLED" ? "border-destructive/30 bg-destructive/10 text-destructive" : status === "ACTIVE" || status === "RECRUITING" ? "border-primary/30 bg-primary/15 text-foreground" : "border-border bg-muted text-muted-foreground"}`}
    >
      {label(status)}
    </span>
  );
}
export function LoadingState() {
  return (
    <div
      role="status"
      className={`${panelClass} flex items-center gap-3 text-sm text-muted-foreground`}
    >
      <Loader2 className="size-4 animate-spin" />
      Loading collaboration projects…
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div role="alert" className={`${panelClass} space-y-3`}>
      <p className="text-sm text-destructive">{error.message}</p>
      <Button variant="outline" onClick={retry}>
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={`${panelClass} py-12 text-center`}>
      <Users className="mx-auto mb-3 size-7 text-muted-foreground" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
export function Person({ person }: { person: TeamMember }) {
  return (
    <Link
      href={`/preview/${person.userId}`}
      className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="size-10">
        <AvatarImage src={person.imageUrl ?? undefined} alt="" />
        <AvatarFallback>
          {(person.name || "?")
            .split(/\s+/)
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold hover:underline">
          {person.name || "View profile"}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {person.roleTitle || person.title || "Candidate"}
        </span>
      </span>
    </Link>
  );
}
export function Explanation({
  explanation,
}: {
  explanation: MatchExplanation;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {explanation.summary}
      </p>
      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3">
        {[
          ["Team gap fit", explanation.gapFitPercentage],
          ["Role skills", explanation.skillCoveragePercentage],
          ["Team overlap", explanation.teamOverlapPercentage],
        ].map(([name, value]) => (
          <div key={name}>
            <dt className="text-[11px] text-muted-foreground">{name}</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              {value}%
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        Lower team overlap means more complementary skills.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {explanation.coveredSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-primary/15 px-2 py-1 text-xs"
          >
            Covers {skill}
          </span>
        ))}
        {explanation.missingSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
          >
            Missing {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
export function MembershipButtons({
  membership,
  isOwner = false,
}: {
  membership: Membership;
  isOwner?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const refresh = useRefreshCollaboration();
  async function act(action: "ACCEPT" | "DECLINE" | "LEAVE") {
    if (
      action === "LEAVE" &&
      !window.confirm(
        "Leave this project? You cannot rejoin this project after leaving.",
      )
    )
      return;
    if (
      action === "DECLINE" &&
      !window.confirm(
        "End this invitation or request? This person cannot be invited to this project again.",
      )
    )
      return;
    setBusy(true);
    try {
      await unwrap(changeMembership(membership.id, action));
      toast.success(
        action === "ACCEPT"
          ? "Team updated. Suggestions are being refreshed."
          : "Membership updated.",
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      await refresh();
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {membershipActions(membership, isOwner).map(
        ({ action, label: title }) => (
          <Button
            key={action}
            disabled={busy}
            variant={action === "ACCEPT" ? "default" : "outline"}
            onClick={() => act(action)}
          >
            {busy && <Loader2 className="size-3 animate-spin" />}
            {title}
          </Button>
        ),
      )}
    </div>
  );
}
export function MessageDialog({
  title,
  description,
  open,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  children?: React.ReactNode;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              await onSubmit(message.trim());
              onClose();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {children}
          <label className="block space-y-2 text-sm">
            <span>
              Introduce yourself{" "}
              <span className="text-muted-foreground">(optional)</span>
            </span>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share what you would like to build together."
            />
          </label>
          <p className="text-xs text-muted-foreground">
            This message is sent once. Once you join, use profile contact
            details to keep in touch.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}Send{" "}
            {title.toLowerCase().includes("invite") ? "invitation" : "request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
