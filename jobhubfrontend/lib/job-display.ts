export function formatJobSalary(min?: number, max?: number, currency = "USD") {
  const lower =
    typeof min === "number" && Number.isFinite(min) ? min : undefined;
  const upper =
    typeof max === "number" && Number.isFinite(max) ? max : undefined;
  if (lower === undefined && upper === undefined) return "Not disclosed";
  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    });
  } catch {
    formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  }
  if (lower !== undefined && upper !== undefined) {
    return lower === upper
      ? formatter.format(lower)
      : `${formatter.format(lower)} – ${formatter.format(upper)}`;
  }
  return lower !== undefined
    ? `From ${formatter.format(lower)}`
    : `Up to ${formatter.format(upper!)}`;
}

export function formatJobDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function jobLabel(value?: string) {
  const labels: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    ON_SITE: "On-site",
    BEGINNER: "Entry level",
    INTERMEDIATE: "Mid-level",
    EXPERT: "Senior level",
  };
  return value
    ? (labels[value] ??
        value
          .toLowerCase()
          .replaceAll("_", " ")
          .replace(/^./, (letter) => letter.toUpperCase()))
    : "Not specified";
}
