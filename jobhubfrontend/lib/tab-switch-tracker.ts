export interface TabSwitchEventRecord {
  eventType: string;
  timestamp: string;
  details?: string;
}

export interface TabSwitchSnapshot {
  tabSwitchCount: number;
  events: TabSwitchEventRecord[];
}

interface TabSwitchTrackerOptions {
  page: Pick<
    Document,
    "hidden" | "hasFocus" | "addEventListener" | "removeEventListener"
  >;
  browser: Pick<Window, "addEventListener" | "removeEventListener">;
  initialCount?: number;
  record: (event: TabSwitchEventRecord) => Promise<unknown>;
  onChange: (snapshot: TabSwitchSnapshot) => void;
  onError: (error: unknown) => void;
}

export const FOCUS_SWITCH_DELAY_MS = 350;

export function startTabSwitchTracker({
  page,
  browser,
  initialCount = 0,
  record,
  onChange,
  onError,
}: TabSwitchTrackerOptions): () => void {
  let active = true;
  let away = page.hidden || !page.hasFocus();
  let contextMenuOpen = false;
  let tabSwitchCount = initialCount;
  let blurTimer: ReturnType<typeof setTimeout> | undefined;
  const events: TabSwitchEventRecord[] = [];
  let queue = Promise.resolve();

  const cancelBlur = () => {
    clearTimeout(blurTimer);
    blurTimer = undefined;
  };

  const depart = (eventType: "TAB_SWITCH" | "WINDOW_BLUR") => {
    if (!active || away) return;
    away = true;
    const event = {
      eventType,
      timestamp: new Date().toISOString(),
      details:
        eventType === "TAB_SWITCH"
          ? "Assessment tab became hidden"
          : "Assessment lost focus to another window or application",
    };
    events.push(event);
    tabSwitchCount += 1;
    onChange({ tabSwitchCount, events: [...events] });

    // The existing API returns a job-wide historical total. The IDE displays
    // this assignment's count, so that response must never replace it.
    // Serialize telemetry and never retry a possibly accepted POST.
    queue = queue.then(async () => {
      try {
        await record(event);
      } catch (error) {
        onError(error);
      }
    });
  };

  const handleFocus = () => {
    cancelBlur();
    contextMenuOpen = false;
    if (!page.hidden && page.hasFocus()) away = false;
  };

  const handleVisibilityChange = () => {
    if (page.hidden) {
      cancelBlur();
      depart("TAB_SWITCH");
    } else if (page.hasFocus()) {
      handleFocus();
    }
  };

  const handleBlur = () => {
    cancelBlur();
    // Delay focus-only signals: native menus and iframe/editor focus can
    // briefly blur the top-level window without leaving the assessment.
    blurTimer = setTimeout(() => {
      blurTimer = undefined;
      if (!contextMenuOpen && !page.hasFocus()) depart("WINDOW_BLUR");
    }, FOCUS_SWITCH_DELAY_MS);
  };

  const handleContextMenu = () => {
    contextMenuOpen = true;
    cancelBlur();
  };
  const handleInteraction = () => {
    contextMenuOpen = false;
    if (page.hasFocus()) handleFocus();
  };

  page.addEventListener("visibilitychange", handleVisibilityChange);
  page.addEventListener("contextmenu", handleContextMenu);
  page.addEventListener("pointerdown", handleInteraction);
  page.addEventListener("keydown", handleInteraction);
  browser.addEventListener("blur", handleBlur);
  browser.addEventListener("focus", handleFocus);

  return () => {
    active = false;
    cancelBlur();
    page.removeEventListener("visibilitychange", handleVisibilityChange);
    page.removeEventListener("contextmenu", handleContextMenu);
    page.removeEventListener("pointerdown", handleInteraction);
    page.removeEventListener("keydown", handleInteraction);
    browser.removeEventListener("blur", handleBlur);
    browser.removeEventListener("focus", handleFocus);
  };
}
