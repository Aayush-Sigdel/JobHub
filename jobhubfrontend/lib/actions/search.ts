"use server";

import { fetchWithAuth } from "@/lib/service-api";
import type { JobPostResponse } from "@/types/api/jobs";
import type { Project } from "@/types/api/collaboration";
import type { ListingSearchResults } from "@/types/api/search";

export async function searchApplicantListings(
  query: string,
): Promise<ListingSearchResults> {
  const term = query.trim().slice(0, 120);
  const [jobs, projects] = await Promise.allSettled([
    fetchWithAuth<JobPostResponse[]>(
      `/jobs?${new URLSearchParams({ ...(term ? { query: term } : {}), sortBy: "date" })}`,
      { cache: "no-store" },
    ),
    fetchWithAuth<Project[]>(
      `/collab/projects?${new URLSearchParams({ ...(term ? { query: term } : {}), status: "RECRUITING" })}`,
      { cache: "no-store" },
    ),
  ]);
  return {
    jobs:
      jobs.status === "fulfilled"
        ? {
            total: jobs.value.length,
            items: jobs.value.slice(0, 5).map((job) => ({
              id: job.id,
              title: job.title,
              subtitle: [job.companyName, job.location]
                .filter(Boolean)
                .join(" · "),
              href: `/find-job/${encodeURIComponent(job.id)}`,
            })),
          }
        : { items: [], total: 0, error: "Jobs couldn’t be loaded." },
    projects:
      projects.status === "fulfilled"
        ? {
            total: projects.value.length,
            items: projects.value.slice(0, 5).map((project) => ({
              id: project.id,
              title: project.title,
              subtitle: [
                project.ownerName,
                project.location ||
                  project.workplaceType.toLowerCase().replaceAll("_", " "),
              ]
                .filter(Boolean)
                .join(" · "),
              href: `/collaborators/projects/${encodeURIComponent(project.id)}`,
            })),
          }
        : { items: [], total: 0, error: "Projects couldn’t be loaded." },
  };
}
