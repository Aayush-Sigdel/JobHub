import type { CandidateSocialSnapshotDto } from "../types/api/recruiter";

export interface SnapshotReplayEvent {
  kind: "source" | "note" | "summary";
  platform: string;
  text: string;
  updatedAt?: string;
}

export const SNAPSHOT_REPLAY_LIMIT = 10;
export const SNAPSHOT_SUMMARY_LIMIT = 3;

export function limitedSnapshotNotes(snapshot: CandidateSocialSnapshotDto) {
  const notes = (snapshot.aiCoolFeedItems ?? []).filter(
    (note): note is string => typeof note === "string" && Boolean(note.trim()),
  );
  return {
    notes: notes.slice(0, SNAPSHOT_REPLAY_LIMIT),
    hiddenCount: Math.max(0, notes.length - SNAPSHOT_REPLAY_LIMIT),
  };
}

export function limitedEvidenceValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .slice(0, SNAPSHOT_SUMMARY_LIMIT)
      .map((item) => limitedEvidenceValue(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        limitedEvidenceValue(item),
      ]),
    );
  }
  return value;
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
    for (const note of limitedSnapshotNotes(snapshot).notes) {
      events.push({ kind: "note", platform: snapshot.platform, text: note });
    }
    for (const [key, value] of Object.entries(snapshot.summary ?? {})) {
      const label = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replaceAll("_", " ");
      const limitedValue = limitedEvidenceValue(value);
      const text =
        typeof limitedValue === "string"
          ? limitedValue
          : (JSON.stringify(limitedValue, null, 2) ?? "Not available");
      events.push({
        kind: "summary",
        platform: snapshot.platform,
        text: `${label}: ${text}`,
      });
    }
    return events;
  });
}
