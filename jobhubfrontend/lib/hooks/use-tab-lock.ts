"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  startTabSwitchTracker,
  type TabSwitchSnapshot,
} from "@/lib/tab-switch-tracker";

interface UseTabLockOptions {
  jobId: string;
  enabled: boolean;
  warningLimit: number;
  sessionKey: string;
  initialCount: number;
}

export function useTabLock({
  jobId,
  enabled,
  warningLimit,
  sessionKey,
  initialCount,
}: UseTabLockOptions) {
  const [snapshot, setSnapshot] = useState<
    TabSwitchSnapshot & { sessionKey: string }
  >({
    sessionKey: "",
    tabSwitchCount: 0,
    events: [],
  });

  useEffect(() => {
    if (!enabled || !jobId) return;

    const stopTracking = startTabSwitchTracker({
      page: document,
      browser: window,
      initialCount,
      record: async (event) => {
        await api.post(`/jobs/${jobId}/tab-switch`, {
          eventType: event.eventType,
          details: event.details,
        });
      },
      onChange: (next) => {
        setSnapshot({ ...next, sessionKey });
        try {
          sessionStorage.setItem(sessionKey, String(next.tabSwitchCount));
        } catch {
          // Monitoring still works when browser storage is unavailable.
        }
      },
      onError: (error) =>
        console.error("Failed to record assessment switch", error),
    });

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      stopTracking();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, jobId, sessionKey, initialCount]);

  const { tabSwitchCount, events } =
    snapshot.sessionKey === sessionKey
      ? snapshot
      : { tabSwitchCount: initialCount, events: [] };

  return {
    tabSwitchCount,
    isWarning: tabSwitchCount > 0 && tabSwitchCount < warningLimit,
    isLimitExceeded: tabSwitchCount > 0 && tabSwitchCount >= warningLimit,
    events,
  };
}
