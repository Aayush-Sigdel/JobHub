"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AppWindow,
  Maximize2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabLock } from "@/lib/hooks/use-tab-lock";

const AssessmentContext = createContext({
  expanded: false,
  monitoring: false,
  tabSwitchCount: 0,
  warningLimit: 0,
});

export const useAssessmentSession = () => useContext(AssessmentContext);

export function AssessmentSession({
  jobId,
  taskId,
  title,
  kind,
  monitored,
  warningLimit,
  completed,
  children,
}: {
  jobId?: string | null;
  taskId?: string;
  title: string;
  kind: string;
  monitored: boolean;
  warningLimit: number;
  completed: boolean;
  children: ReactNode;
}) {
  const sessionKey = `jobhub:assessment-monitor:v2:${jobId}:${kind}:${taskId}`;
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [initialCount, setInitialCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const ownsFullscreen = useRef(false);
  const mounted = useRef(true);
  const startInFlight = useRef(false);
  const eligible = Boolean(monitored && jobId && taskId);
  const monitoring = eligible && started && !completed;
  const expanded = eligible && started;
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: monitoring,
    warningLimit,
    sessionKey,
    initialCount,
  });

  useEffect(() => {
    mounted.current = true;
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => {
      mounted.current = false;
      document.removeEventListener("fullscreenchange", update);
      if (ownsFullscreen.current && document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  async function enterFullscreen() {
    setFullscreenMessage("");
    if (
      !document.documentElement.requestFullscreen ||
      !document.fullscreenEnabled
    ) {
      setFullscreenMessage(
        "Fullscreen is unavailable in this browser. You can continue in the expanded IDE.",
      );
      return;
    }
    try {
      if (!document.fullscreenElement) {
        // Fullscreen the document so editor menus and submit dialogs that
        // portal to document.body remain visible and usable.
        await document.documentElement.requestFullscreen();
        if (!mounted.current) {
          if (document.fullscreenElement) await document.exitFullscreen();
          return;
        }
        ownsFullscreen.current = true;
      }
      setFullscreen(true);
    } catch {
      setFullscreenMessage(
        "Fullscreen could not open. You can continue here or try fullscreen again.",
      );
    }
  }

  async function startAssignment() {
    if (startInFlight.current) return;
    startInFlight.current = true;
    setStarting(true);
    let count = 0;
    try {
      const saved = Number(sessionStorage.getItem(sessionKey));
      if (Number.isSafeInteger(saved) && saved >= 0) count = saved;
      sessionStorage.setItem(sessionKey, String(count));
    } catch {
      // Storage is optional; keep an in-memory count for this assignment.
    }
    setInitialCount(count);
    // Invoke directly from the click to retain browser user activation.
    await enterFullscreen();
    if (!mounted.current) return;
    setStarted(true);
    setStarting(false);
  }

  if (eligible && !started && !completed) {
    return (
      <section
        className="mx-auto my-8 max-w-2xl rounded-xl border bg-background p-6 text-foreground sm:my-12 sm:p-10"
        aria-labelledby="assignment-start-title"
      >
        <p className="mb-3 text-sm text-muted-foreground">{kind} assessment</p>
        <h1
          id="assignment-start-title"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Before you start
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{title}</p>
        <div className="my-8 space-y-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="text-sm font-medium">
                This assignment is monitored
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Switching tabs, browser windows, or apps is recorded with your
                application. Leaving and returning counts as one switch.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <AppWindow className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="text-sm font-medium">
                Keep this assignment in focus
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The warning limit is {warningLimit} switches. Right-click, copy
                and paste, and moving between editor panels do not add switches.
                We detect focus loss, not which app you open.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Maximize2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="text-sm font-medium">
                Your IDE opens in fullscreen
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Monitoring begins after you press Start Assignment and stops
                when your submission is recorded. If you reload, your switch
                count for this assignment is kept in this tab.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <Button asChild variant="ghost">
            <Link href={`/find-job/${jobId}`}>
              <ArrowLeft className="size-4" />
              Back to job
            </Link>
          </Button>
          <Button onClick={startAssignment} disabled={starting}>
            {starting ? "Opening assignment…" : "Start Assignment"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <AssessmentContext.Provider
      value={{ expanded, monitoring, tabSwitchCount, warningLimit }}
    >
      <div
        className={
          expanded
            ? "fixed inset-0 z-50 flex h-dvh flex-col overflow-y-auto bg-background text-foreground"
            : undefined
        }
      >
        {expanded && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2 text-xs">
            <p role="status" className="text-muted-foreground">
              {completed
                ? "Assignment submitted. Monitoring has stopped."
                : fullscreenMessage ||
                  "Monitoring is active. Tab and app switches are recorded."}
            </p>
            {!fullscreen && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={enterFullscreen}
              >
                <Maximize2 className="size-3.5" />
                Enter fullscreen
              </Button>
            )}
          </div>
        )}
        {children}
      </div>
    </AssessmentContext.Provider>
  );
}
