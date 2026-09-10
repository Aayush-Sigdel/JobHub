"use client";

import JobMarkdown from "@/components/jobs/JobMarkdown";

import React, { useRef, useState, memo } from "react";
import {
  Star,
  Zap,
  SlidersHorizontal,
  Lock,
  ShieldCheck,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RangeSlider } from "@/components/motion/range-slider";
import { DesignTask, ScoreResult, PASSING_TOLERANCE } from "@/lib/task/css_data";

interface CodeOutputCanvasProps {
  task: DesignTask & {
    imageBytes?: string;
    imageContentType?: string;
  };
  debouncedPreviewCode: string;
  lastScore: ScoreResult | null;
  highScore: ScoreResult | null;
  isTargetScoreMet: boolean;
}

function imageDataUrl(imageBytes: string, contentType?: string) {
  return `data:${contentType || "image/png"};base64,${imageBytes}`;
}

export const CodeOutputCanvas = memo(
  ({
    task,
    debouncedPreviewCode,
    lastScore,
    highScore,
    isTargetScoreMet,
  }: CodeOutputCanvasProps) => {
    const [slideCompare, setSlideCompare] = useState<boolean>(true);
    const [diffMode, setDiffMode] = useState<boolean>(false);
    const [opacity, setOpacity] = useState<number>(100);
    const [showChallengeDetails, setShowChallengeDetails] = useState<boolean>(false);

    // Direct DOM hardware-accelerated slider refs
    const containerRef = useRef<HTMLDivElement>(null);
    const clipLayerRef = useRef<HTMLDivElement>(null);
    const handleLineRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef<boolean>(false);
    const sliderPosRef = useRef<number>(50);

    const updateCurtainDOM = (pct: number) => {
      sliderPosRef.current = pct;
      if (clipLayerRef.current) {
        clipLayerRef.current.style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
      }
      if (handleLineRef.current) {
        handleLineRef.current.style.left = `${pct}%`;
      }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      requestAnimationFrame(() => {
        updateCurtainDOM(pct);
      });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    return (
      <div className="w-full lg:w-[470px] xl:w-[490px] shrink-0 h-full flex flex-col p-6 select-none overflow-y-auto bg-card">
        {/* 1. Header: Strictly at top */}
        <div className="flex items-center justify-between pb-3.5 text-xs font-mono text-foreground border-b border-border shrink-0 whitespace-nowrap">
          <span className="font-bold text-sm whitespace-nowrap">Code output</span>

          <div className="flex items-center gap-3.5 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground transition-colors whitespace-nowrap">
              <input
                type="checkbox"
                checked={slideCompare}
                onChange={(e) => setSlideCompare(e.target.checked)}
                className="rounded border-border bg-muted text-tomato-500 accent-tomato-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-medium">Slide &amp; Compare</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground transition-colors whitespace-nowrap">
              <input
                type="checkbox"
                checked={diffMode}
                onChange={(e) => setDiffMode(e.target.checked)}
                className="rounded border-border bg-muted text-tomato-500 accent-tomato-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-medium">Diff</span>
            </label>
          </div>
        </div>

        {/* 2. 400x300 Code Output Canvas */}
        <div className="flex flex-col items-center py-4 shrink-0">
          <div
            ref={containerRef}
            className="w-[400px] h-[300px] bg-white rounded-2xl shadow-xs overflow-hidden relative border border-border select-none shrink-0"
          >
            {/* Target Layer Underneath (rendered for Slide and/or Diff comparison) */}
            {(slideCompare || diffMode) && (task.imageBytes ? (
              <img
                src={imageDataUrl(task.imageBytes, task.imageContentType)}
                alt="Target comparison"
                className="absolute inset-0 h-[300px] w-[400px] bg-white object-contain pointer-events-none"
              />
            ) : (
              <iframe
                title="Target Underneath"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>* { box-sizing: border-box; } html, body { margin: 0; padding: 0; width: 400px; height: 300px; overflow: hidden; background: #ffffff; }</style></head><body>${task.targetHtml}</body></html>`}
                className="w-[400px] h-[300px] border-0 pointer-events-none absolute inset-0 bg-white"
                loading="eager"
              />
            ))}

            {/* User Live Output Canvas (Hardware-accelerated clipPath & opacity) */}
            <div
              ref={clipLayerRef}
              className="absolute inset-0 w-[400px] h-[300px] overflow-hidden will-change-transform"
              style={{
                clipPath: slideCompare
                  ? `polygon(0 0, ${sliderPosRef.current}% 0, ${sliderPosRef.current}% 100%, 0 100%)`
                  : undefined,
                mixBlendMode: diffMode ? "difference" : "normal",
                opacity: slideCompare ? opacity / 100 : 1,
              }}
            >
              <iframe
                title="User Live Output Canvas"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>* { box-sizing: border-box; } html, body { margin: 0; padding: 0; width: 400px; height: 300px; overflow: hidden; background: #ffffff; }</style></head><body>${debouncedPreviewCode}</body></html>`}
                className="w-[400px] h-[300px] border-0 pointer-events-none bg-white"
              />
            </div>

            {/* Draggable Slide Curtain Handle (120 FPS Direct DOM Position) */}
            {slideCompare && (
              <div
                ref={handleLineRef}
                className="absolute top-0 bottom-0 z-30 cursor-ew-resize touch-none pointer-events-auto will-change-transform"
                style={{ left: `${sliderPosRef.current}%` }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-tomato-500 shadow-[0_0_8px_rgba(241,86,65,0.9)]" />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-tomato-500 flex items-center justify-center shadow-md cursor-ew-resize">
                  <span className="text-[8px] font-bold text-tomato-500">◀▶</span>
                </div>
              </div>
            )}
          </div>

          {/* beUI RangeSlider for Opacity Control in Slide & Compare */}
          {slideCompare && (
            <div className="w-[400px] mt-3 flex items-center justify-between gap-3 bg-card border border-border px-3.5 py-2 rounded-xl text-xs select-none">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-tomato-500" />
                <span>Opacity</span>
              </div>

              <div className="flex-1 px-1">
                <RangeSlider
                  value={opacity}
                  onValueChange={setOpacity}
                  min={10}
                  max={100}
                  step={5}
                  showTicks={true}
                  className="h-6"
                  aria-label="Output Opacity"
                />
              </div>

              <span className="text-foreground font-mono font-bold w-10 text-right shrink-0">
                {opacity}%
              </span>
            </div>
          )}
        </div>

        {/* 3. Stats & Score Cards */}
        <div className="w-[400px] mx-auto space-y-3 mt-1">
          <div className="grid grid-cols-2 gap-3.5 font-mono">
            <div className="p-4 bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-1 text-center shadow-2xs">
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-foreground flex items-baseline gap-1 mt-0.5">
                {lastScore ? (
                  <>
                    <span>{lastScore.score}</span>
                    <span
                      className={`text-xs font-bold ${
                        lastScore.matchPct >= task.minimumMatchingScore - PASSING_TOLERANCE
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-500"
                      }`}
                    >
                      ({lastScore.matchPct}%)
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-sans font-medium">
                Last score
              </span>
            </div>

            <div className="p-4 bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-1 text-center shadow-2xs">
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-foreground flex items-baseline gap-1 mt-0.5">
                {highScore ? (
                  <>
                    <span>{highScore.score}</span>
                    <span className="text-xs text-pacific-blue-500 dark:text-pacific-blue-400 font-normal">
                      {`{${highScore.chars}}`}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-sans font-medium">
                High score
              </span>
            </div>
          </div>

          {/* Target Status Card */}
          <div className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between text-xs text-foreground">
            <div className="flex items-center gap-2">
              {isTargetScoreMet ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="font-semibold text-foreground">
                {isTargetScoreMet
                  ? "Target Achieved — Ready to Submit"
                  : "Submission Locked"}
              </span>
            </div>
            <span
              className={`font-mono text-[11px] font-bold ${
                isTargetScoreMet
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500 dark:text-amber-400"
              }`}
            >
              {lastScore
                ? `${lastScore.matchPct}% / ${task.minimumMatchingScore}%`
                : `Need ≥ ${task.minimumMatchingScore}%`}
            </span>
          </div>

          {/* Instructions Accordion */}
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
            <button
              onClick={() => setShowChallengeDetails(!showChallengeDetails)}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-tomato-500" />
                <span>Task Instructions</span>
              </div>
              {showChallengeDetails ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {showChallengeDetails && (
              <div className="p-3.5 border-t border-border bg-card text-xs text-muted-foreground space-y-2 leading-relaxed">
                <JobMarkdown>{task.instructions}</JobMarkdown>
                <p>
                  • Use <strong>Test Code</strong> to evaluate pixel accuracy
                  against the target ({task.viewport.width} × {task.viewport.height} px).
                </p>
                <p>
                  • <strong>Submit Final Answer</strong> unlocks once your match
                  accuracy reaches at least{" "}
                  <strong>{task.minimumMatchingScore}%</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CodeOutputCanvas.displayName = "CodeOutputCanvas";
export default CodeOutputCanvas;
