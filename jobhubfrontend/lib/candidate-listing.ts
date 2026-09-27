import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { calculateSupportedOverallSimilarity } from "./semantic-match";

export type CandidateFilters = {
  search: string;
  status: string;
  minMatch: string;
  fromDate: string;
  toDate: string;
  sort: string;
};

export function filterCandidates(
  candidates: CandidateDashboardResponse[],
  filters: CandidateFilters,
) {
  const query = filters.search.trim().toLowerCase();
  const from = filters.fromDate
    ? new Date(`${filters.fromDate}T00:00:00`).getTime()
    : null;
  const through = filters.toDate
    ? new Date(`${filters.toDate}T23:59:59.999`).getTime()
    : null;

  return candidates
    .filter((candidate) => {
      const match = calculateSupportedOverallSimilarity(candidate);
      const applied = candidate.appliedAt
        ? Date.parse(candidate.appliedAt)
        : NaN;
      const fields = [
        candidate.name,
        candidate.email,
        candidate.title,
        ...(candidate.skills || []).map((skill) => skill.name),
      ];
      return (
        fields.some((value) => value?.toLowerCase().includes(query)) &&
        (filters.status === "ALL" ||
          (candidate.status || "APPLIED") === filters.status) &&
        (!filters.minMatch ||
          (match !== null && match * 100 >= Number(filters.minMatch))) &&
        (from === null || applied >= from) &&
        (through === null || applied <= through)
      );
    })
    .sort((a, b) =>
      filters.sort === "name"
        ? a.name.localeCompare(b.name)
        : filters.sort === "newest"
          ? (Date.parse(b.appliedAt || "") || 0) -
            (Date.parse(a.appliedAt || "") || 0)
          : (calculateSupportedOverallSimilarity(b) ?? -1) -
            (calculateSupportedOverallSimilarity(a) ?? -1),
    );
}
