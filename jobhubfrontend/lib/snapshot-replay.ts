import type { CandidateSocialSnapshotDto } from "../types/api/recruiter";

export interface SnapshotReplayEvent {
  kind: "source" | "note" | "summary";
  platform: string;
  text: string;
  updatedAt?: string;
}

export function snapshotReplayEvents(
  snapshots: CandidateSocialSnapshotDto[],
): SnapshotReplayEvent[] {
  return snapshots.flatMap((snapshot) => {
    const events: SnapshotReplayEvent[] = [
      {
        kind: "source",
        platform: snapshot.platform,
        text: `${snapshot.platform.replaceAll("_", " ")} snapshot`,
        updatedAt: snapshot.updatedAt,
      },
    ];
    for (const note of snapshot.aiCoolFeedItems ?? []) {
      if (typeof note === "string")
        events.push({ kind: "note", platform: snapshot.platform, text: note });
    }
    for (const [key, value] of Object.entries(snapshot.summary ?? {})) {
      const label = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replaceAll("_", " ");
      const text =
        typeof value === "string"
          ? value
          : (JSON.stringify(value, null, 2) ?? "Not available");
      events.push({
        kind: "summary",
        platform: snapshot.platform,
        text: `${label}: ${text}`,
      });
    }
    return events;
  });
}
