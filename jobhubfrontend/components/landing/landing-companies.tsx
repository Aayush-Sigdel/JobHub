import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { JobPostResponse } from "@/types/api/jobs";

export default async function LandingCompanies() {
  let jobs: JobPostResponse[];
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await fetch(`${base}/jobs?sortBy=date`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Listings unavailable");
    jobs = await response.json();
    if (!Array.isArray(jobs)) throw new Error("Invalid listings");
  } catch {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Company listings are currently unavailable.{" "}
        <Link
          href="/find-job"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Explore jobs
        </Link>
      </p>
    );
  }
  const companies = new Map<string, { name: string; count: number }>();
  for (const job of jobs) {
    if (!(job.isActive ?? job.active ?? true) || !job.companyName?.trim())
      continue;
    const key = job.companyName.trim().toLowerCase();
    const company = companies.get(key);
    if (company) company.count++;
    else companies.set(key, { name: job.companyName.trim(), count: 1 });
  }
  if (!companies.size)
    return (
      <p className="text-center text-sm text-muted-foreground">
        Companies will appear here as new roles are published.
      </p>
    );
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from(companies.values())
        .slice(0, 8)
        .map((company) => (
          <Link
            key={company.name}
            href={`/find-job?query=${encodeURIComponent(company.name)}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {company.name}
              </span>
              <span className="mt-1.5 block text-xs text-muted-foreground">
                {company.count} open role{company.count === 1 ? "" : "s"}
              </span>
            </span>
            <IconArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
    </div>
  );
}
