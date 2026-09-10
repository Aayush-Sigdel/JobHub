import type { ApplicationStatus } from "@/types/api/jobs";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { calculateSupportedOverallSimilarity } from "@/lib/semantic-match";

export const candidateStages: { id: ApplicationStatus; label: string }[] = [
  { id: "APPLIED", label: "Applied" },
  { id: "IN_REVIEW", label: "In review" },
  { id: "SHORTLISTED", label: "Shortlisted" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "REJECTED", label: "Rejected" },
];

export function candidateMatchLabel(candidate: CandidateDashboardResponse) {
  const match = calculateSupportedOverallSimilarity(candidate);
  return match === null ? "Not available" : `${Math.round(match * 100)}%`;
}

export function candidateSubmissions(candidate: CandidateDashboardResponse) {
  return [
    { label: "Design", data: candidate.designSubmission },
    { label: "Programming", data: candidate.programmingSubmission },
    { label: "SQL", data: candidate.sqlSubmission },
  ].flatMap(({ label, data }) => (data ? [{ label, data }] : []));
}

export function reviewScore(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      )
    : "Not available";
}

export function reviewDate(value?: string) {
  return value && !Number.isNaN(Date.parse(value))
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Not available";
}
