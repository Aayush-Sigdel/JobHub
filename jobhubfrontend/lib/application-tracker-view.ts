export const applicationStages = [
  { id: "all", label: "All stages" },
  { id: "applied", label: "Applied" },
  { id: "in-review", label: "In review" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Not selected" },
];

export function resolveTrackerTab(value: string | null) {
  return {
    tab: value === "saved" || value === "in-progress" ? value : "applications",
    stage: applicationStages.some((stage) => stage.id === value)
      ? value!
      : "all",
  };
}

export function matchesTrackedRole(
  title: string,
  company: string,
  query: string,
) {
  return `${title} ${company}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}

export function matchesApplicationStage(status: string, stage: string) {
  return stage === "all" || status.toLowerCase().replaceAll("_", "-") === stage;
}

export function compareTrackedDates(a: string, b: string, oldestFirst = false) {
  return ((Date.parse(b) || 0) - (Date.parse(a) || 0)) * (oldestFirst ? -1 : 1);
}
