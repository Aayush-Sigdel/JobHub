"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronsLeftRight, CircleHelp } from "lucide-react";
import CodeEditor from "@/components/task/CodeEditor";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import { TaskResult } from "@/components/task/TaskResult";
import { useAssessmentSession } from "@/components/task/AssessmentSession";
import type { DesignTaskDto, TaskSubmissionResponse } from "@/types/api/tasks";

// Keep rendering at the evaluator's 400 × 300 viewport; only scale the display.
function CanvasFrame({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = frame.current;
    const content = canvas.current;
    if (!element || !content) return;
    const resize = () => {
      content.style.transform = `scale(${element.clientWidth / 400})`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="relative mx-auto aspect-[4/3] w-full max-w-[400px] overflow-hidden bg-white ring-1 ring-border">
      <div ref={canvas} className="absolute left-0 top-0 h-[300px] w-[400px] origin-top-left">
        {children}
      </div>
    </div>
  );
}

function TargetImage({ src }: { src: string }) {
  // The task API returns the uploaded reference image as base64.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Target design to recreate" width={400} height={300} className="pointer-events-none absolute inset-0 h-[300px] w-[400px] object-contain" />;
}

export function CssBattleWorkspace({
  header, task, code, preview, onCodeChange, isSubmitting, result, error, jobId,
}: {
  header: ReactNode; task: DesignTaskDto; code: string; preview: string;
  onCodeChange: (code: string) => void; isSubmitting: boolean;
  result: TaskSubmissionResponse | null; error: string | null; jobId: string | null;
}) {
  const [slideCompare, setSlideCompare] = useState(false);
  const [difference, setDifference] = useState(false);
  const [position, setPosition] = useState(50);
  const [opacity, setOpacity] = useState(100);
  const { expanded } = useAssessmentSession();
  const targetSrc = `data:${task.imageContentType || "image/png"};base64,${task.imageBytes}`;

  return (
    <div className={expanded
      ? "flex min-h-0 w-full flex-1 flex-col bg-background text-foreground xl:overflow-hidden"
      : "mx-auto flex max-w-[1800px] flex-col overflow-hidden rounded-xl border bg-background text-foreground xl:h-[calc(100dvh-112px)] xl:min-h-[650px]"}>
      {header}
      <main className="grid min-h-0 flex-1 md:grid-cols-2 xl:grid-cols-[minmax(320px,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-label="HTML and CSS editor" className="flex h-[540px] min-w-0 flex-col overflow-hidden border-b md:col-span-2 xl:col-span-1 xl:h-auto xl:min-h-0 xl:border-b-0 xl:border-r">
          <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
            <h2 className="text-sm font-semibold">Code editor</h2>
            <span className="text-xs text-muted-foreground">HTML / CSS</span>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor value={code} onChange={onCodeChange} readOnly={isSubmitting} />
          </div>
        </section>

        <section aria-label="Code output" className="min-w-0 border-b md:border-r md:border-b-0 xl:overflow-y-auto">
          <div className="flex h-12 items-center justify-between border-b px-4">
            <h2 className="text-sm font-semibold">Code output</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" />Live preview</span>
          </div>
          <div className="space-y-4 p-4">
            <div className="relative focus-within:rounded-sm focus-within:ring-2 focus-within:ring-ring">
              <CanvasFrame>
                {(slideCompare || difference) && <TargetImage src={targetSrc} />}
                <div className="absolute inset-0" style={{
                  clipPath: slideCompare ? `inset(0 ${100 - position}% 0 0)` : undefined,
                  mixBlendMode: difference ? "difference" : "normal",
                  opacity: slideCompare || difference ? opacity / 100 : 1,
                }}>
                  <iframe title="Your live HTML and CSS output" sandbox="" srcDoc={preview} className="pointer-events-none h-[300px] w-[400px] border-0 bg-white" />
                </div>
                {slideCompare && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${position}%` }}>
                    <span className="absolute top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-background text-foreground shadow-sm">
                      <ChevronsLeftRight className="size-4" />
                    </span>
                  </div>
                )}
              </CanvasFrame>
              {slideCompare && <input type="range" min={0} max={100} value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label="Slide to compare your output with the target" aria-valuetext={`${position}% output, ${100 - position}% target`} className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0" />}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={slideCompare} onChange={(event) => setSlideCompare(event.target.checked)} className="size-3.5 accent-primary" /> Slide & compare
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={difference} onChange={(event) => setDifference(event.target.checked)} className="size-3.5 accent-primary" /> Difference
              </label>
            </div>
            {(slideCompare || difference) && (
              <label className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Opacity</span>
                <input type="range" min={10} max={100} step={5} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="min-w-0 flex-1 accent-primary" />
                <span className="w-8 text-right tabular-nums">{opacity}%</span>
              </label>
            )}
            <p className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
              <CircleHelp className="mt-0.5 size-3.5 shrink-0" />
              {difference ? "Difference view highlights visual differences. It does not calculate your score." : slideCompare ? "Drag across the canvas to compare. Your output is on the left; the target is on the right." : "Preview updates as you type. Enable comparison to check your layout against the target."}
            </p>
          </div>
          {result || error ? <TaskResult result={result} error={error} jobId={jobId} /> : (
            <div className="mx-4 mb-4 space-y-2 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">Submission result</span>
                <span className="text-xs text-muted-foreground">{isSubmitting ? "Evaluating…" : "Not submitted"}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground" role="status">{isSubmitting ? "Your solution is being rendered and evaluated." : "Submit when you're ready. Your score and pass/fail result come from the evaluation service."}</p>
            </div>
          )}
        </section>

        <section aria-label="Target design and instructions" className="min-w-0 xl:overflow-y-auto">
          <div className="flex h-12 items-center justify-between border-b px-4">
            <h2 className="text-sm font-semibold">Recreate this target</h2>
            <span className="text-xs tabular-nums text-muted-foreground">400 × 300</span>
          </div>
          <div className="space-y-5 p-4">
            <CanvasFrame><TargetImage src={targetSrc} /></CanvasFrame>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs">
              <span className="text-muted-foreground">Required match</span>
              <span className="font-semibold">{task.minimumMatchingScore}%</span>
            </div>
            <section className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">Instructions</h3>
                <span className="text-xs capitalize text-muted-foreground">{task.skillLevel.toLowerCase()}</span>
              </div>
              <JobMarkdown>{task.instructions}</JobMarkdown>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
