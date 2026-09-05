import Link from "next/link";
import { ArrowUpRight, Briefcase, LayoutDashboard, Plus, Users } from "lucide-react";

export function EmployerShortcuts() {
  return (
    <nav
      className="rounded-2xl border border-border bg-card p-3 shadow-xs space-y-1"
      aria-label="Employer shortcuts"
    >
      <Link
        href="/post-job"
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2.5 text-foreground">
          <Plus className="size-4 text-foreground" /> Post a new role
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </Link>
      <Link
        href="/manage-jobs"
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2.5 text-foreground">
          <Briefcase className="size-4 text-foreground" /> Manage job listings
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </Link>
      <Link
        href="/candidates"
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2.5 text-foreground">
          <Users className="size-4 text-foreground" /> Candidate pipeline
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </Link>
      <Link
        href="/dashboard"
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2.5 text-foreground">
          <LayoutDashboard className="size-4 text-foreground" /> Employer dashboard
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </Link>
    </nav>
  );
}
