'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import type { RecordTabSwitchResponse } from '@/types/api/jobs';

interface UseTabLockOptions {
  jobId: string;
  enabled: boolean;
  warningLimit: number;
}

interface UseTabLockReturn {
  tabSwitchCount: number;
  isWarning: boolean;
  isLimitExceeded: boolean;
  events: TabSwitchEventRecord[];
}

interface TabSwitchEventRecord {
  eventType: string;
  timestamp: string;
  durationSeconds?: number;
  details?: string;
}

export function useTabLock({ jobId, enabled, warningLimit }: UseTabLockOptions): UseTabLockReturn {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [events, setEvents] = useState<TabSwitchEventRecord[]>([]);
  const lastHiddenTime = useRef<number | null>(null);

  const recordTabSwitch = useCallback(async (event: TabSwitchEventRecord) => {
    setEvents(prev => [...prev, event]);
    setTabSwitchCount(prev => prev + 1);

    try {
      const response = await api.post<RecordTabSwitchResponse>(`/jobs/${jobId}/tab-switch`, {
        eventType: event.eventType,
        durationSeconds: event.durationSeconds,
        details: event.details,
      });
      setTabSwitchCount(response.data.tabSwitchCount);
    } catch (err) {
      console.error('Failed to record tab switch event', err);
    }
  }, [jobId]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastHiddenTime.current = Date.now();
      } else {
        const durationSeconds = lastHiddenTime.current
          ? Math.round((Date.now() - lastHiddenTime.current) / 1000)
          : undefined;
        lastHiddenTime.current = null;

        recordTabSwitch({
          eventType: 'TAB_SWITCH',
          timestamp: new Date().toISOString(),
          durationSeconds,
          details: `User left tab for ${durationSeconds || 'unknown'} seconds`,
        });
      }
    };

    const handleBlur = () => {
      recordTabSwitch({
        eventType: 'WINDOW_BLUR',
        timestamp: new Date().toISOString(),
        details: 'Window lost focus',
      });
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You are in an assessment. Leaving the page may affect your application.';
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordTabSwitch({
        eventType: 'CONTEXT_MENU',
        timestamp: new Date().toISOString(),
        details: 'Right-click attempted during assessment',
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect copy/paste/cut shortcuts
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        recordTabSwitch({
          eventType: 'CLIPBOARD_ACTION',
          timestamp: new Date().toISOString(),
          details: `Ctrl+${e.key.toUpperCase()} detected during assessment`,
        });
      }
      // Detect Alt+Tab, F11, etc.
      if (e.altKey && e.key === 'Tab') {
        recordTabSwitch({
          eventType: 'ALT_TAB',
          timestamp: new Date().toISOString(),
          details: 'Alt+Tab detected',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, recordTabSwitch]);

  return {
    tabSwitchCount,
    isWarning: tabSwitchCount > 0 && tabSwitchCount < warningLimit,
    isLimitExceeded: tabSwitchCount >= warningLimit,
    events,
  };
}
