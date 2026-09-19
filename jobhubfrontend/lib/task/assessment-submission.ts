import type { TaskSubmissionResponse } from "@/types/api/tasks";

export function evaluationRequiresOverride(
  result?: TaskSubmissionResponse | null,
  error?: string | null,
): boolean {
  if (error || !result) return true;
  return (
    Boolean(result.message) ||
    !result.passed ||
    result.achievedScore < result.requiredScore
  );
}
