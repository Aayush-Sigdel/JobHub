"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import pixelmatch from "pixelmatch";
import {
  SplitSquareVertical,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

export type DiffMode = "compare" | "pixelmatch" | "xray";

interface VisualDiffViewerProps {
  userHtml: string;
  targetHtml: string;
  width?: number;
  height?: number;
  onMatchCalculated?: (matchScore: number, diffPixels: number) => void;
}

export const VisualDiffViewer: React.FC<VisualDiffViewerProps> = ({
  userHtml,
  targetHtml,
  width = 400,
  height = 300,
  onMatchCalculated,
}) => {
  const [diffMode, setDiffMode] = useState<DiffMode>("compare");
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [opacity, setOpacity] = useState<number>(100);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // 120 FPS GPU Pointer-Captured Dragging
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
    setSliderPos(pct);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Pixelmatch Real-Time Diff Computation
  const runPixelmatch = useCallback(() => {
    try {
      const offscreenUser = document.createElement("canvas");
      offscreenUser.width = width;
      offscreenUser.height = height;
      const ctxUser = offscreenUser.getContext("2d");

      const offscreenTarget = document.createElement("canvas");
      offscreenTarget.width = width;
      offscreenTarget.height = height;
      const ctxTarget = offscreenTarget.getContext("2d");

      const diffCanvas = diffCanvasRef.current;
      if (!ctxUser || !ctxTarget || !diffCanvas) return;

      diffCanvas.width = width;
      diffCanvas.height = height;
      const ctxDiff = diffCanvas.getContext("2d");
      if (!ctxDiff) return;

      const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">${userHtml}</div></foreignObject></svg>`;
      const targetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">${targetHtml}</div></foreignObject></svg>`;

      const userBlob = new Blob([userSvg], { type: "image/svg+xml;charset=utf-8" });
      const targetBlob = new Blob([targetSvg], { type: "image/svg+xml;charset=utf-8" });

      const userUrl = URL.createObjectURL(userBlob);
      const targetUrl = URL.createObjectURL(targetBlob);

      const userImg = new Image();
      const targetImg = new Image();

      let loaded = 0;
      const onBothLoaded = () => {
        ctxUser.drawImage(userImg, 0, 0, width, height);
        ctxTarget.drawImage(targetImg, 0, 0, width, height);

        const imgDataUser = ctxUser.getImageData(0, 0, width, height);
        const imgDataTarget = ctxTarget.getImageData(0, 0, width, height);
        const diffImgData = ctxDiff.createImageData(width, height);

        const mismatched = pixelmatch(
          imgDataUser.data,
          imgDataTarget.data,
          diffImgData.data,
          width,
          height,
          {
            threshold: 0.08,
            diffColor: [241, 86, 65],
            aaColor: [247, 183, 7],
            diffColorAlt: [58, 169, 196],
            alpha: 0.25,
          }
        );

        ctxDiff.putImageData(diffImgData, 0, 0);

        const totalPixels = width * height;
        const accuracy = Math.max(0, Math.min(100, ((totalPixels - mismatched) / totalPixels) * 100));
        const formattedScore = parseFloat(accuracy.toFixed(2));

        setMatchScore(formattedScore);

        if (onMatchCalculated) {
          onMatchCalculated(formattedScore, mismatched);
        }

        URL.revokeObjectURL(userUrl);
        URL.revokeObjectURL(targetUrl);
      };

      userImg.onload = () => {
        loaded++;
        if (loaded === 2) onBothLoaded();
      };
      targetImg.onload = () => {
        loaded++;
        if (loaded === 2) onBothLoaded();
      };

      userImg.src = userUrl;
      targetImg.src = targetUrl;
    } catch {
      // fallback
    }
  }, [userHtml, targetHtml, width, height, onMatchCalculated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runPixelmatch();
    }, 150);
    return () => clearTimeout(timer);
  }, [runPixelmatch]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 1. Minimal Header with Diff Mode Toolbar */}
      <div className="w-[400px] flex items-center justify-between text-xs whitespace-nowrap">
        <span className="font-semibold text-foreground">Your Output</span>

        {/* 3 Clean Mode Pills */}
        <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setDiffMode("compare")}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
              diffMode === "compare"
                ? "bg-card text-tomato-500 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Slide & Compare split curtain"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Slide</span>
          </button>

          <button
            onClick={() => setDiffMode("pixelmatch")}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
              diffMode === "pixelmatch"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Pixelmatch difference highlighter"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diff</span>
          </button>

          <button
            onClick={() => setDiffMode("xray")}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
              diffMode === "xray"
                ? "bg-card text-amber-600 dark:text-tuscan-sun-400 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="X-Ray pixel difference"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>X-Ray</span>
          </button>
        </div>
      </div>

      {/* 2. 400x300 Canvas Stage */}
      <div
        ref={containerRef}
        className="w-[400px] h-[300px] bg-white rounded-xl shadow-xs overflow-hidden relative border border-border select-none shrink-0"
      >
        {/* Target Layer Underneath */}
        <iframe
          title="Target Underneath"
          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>* { box-sizing: border-box; } html, body { margin: 0; padding: 0; width: 400px; height: 300px; overflow: hidden; background: #ffffff; }</style></head><body>${targetHtml}</body></html>`}
          className="w-[400px] h-[300px] border-0 pointer-events-none absolute inset-0 bg-white"
        />

        {/* User Live Output Canvas */}
        <div
          className="absolute inset-0 w-[400px] h-[300px] overflow-hidden"
          style={{
            clipPath:
              diffMode === "compare"
                ? `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                : undefined,
            mixBlendMode: diffMode === "xray" ? "difference" : "normal",
            opacity: diffMode === "compare" ? opacity / 100 : 1,
            display: diffMode === "pixelmatch" ? "none" : "block",
          }}
        >
          <iframe
            title="User Live Output"
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>* { box-sizing: border-box; } html, body { margin: 0; padding: 0; width: 400px; height: 300px; overflow: hidden; background: #ffffff; }</style></head><body>${userHtml}</body></html>`}
            className="w-[400px] h-[300px] border-0 pointer-events-none bg-white"
          />
        </div>

        {/* Pixelmatch Overlay Canvas */}
        <canvas
          ref={diffCanvasRef}
          width={width}
          height={height}
          className={`w-[400px] h-[300px] absolute inset-0 pointer-events-none ${
            diffMode === "pixelmatch" ? "block" : "hidden"
          }`}
        />

        {/* Draggable Curtain Handle */}
        {diffMode === "compare" && (
          <div
            className="absolute top-0 bottom-0 z-30 cursor-ew-resize touch-none pointer-events-auto"
            style={{ left: `${sliderPos}%` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-tomato-500 shadow-[0_0_8px_rgba(241,86,65,0.9)]" />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-tomato-500 flex items-center justify-center shadow-md cursor-ew-resize select-none">
              <span className="text-[8px] font-bold text-tomato-500">◀▶</span>
            </div>
          </div>
        )}
      </div>

      {/* Opacity Control for Compare Mode */}
      {diffMode === "compare" && (
        <div className="w-[400px] flex items-center justify-between gap-2.5 px-2 py-1 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-1 text-[11px]">
            <SlidersHorizontal className="w-3 h-3 text-tomato-500" />
            <span>Opacity</span>
          </div>

          <input
            type="range"
            min={10}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="flex-1 accent-tomato-500 cursor-pointer h-1.5 bg-muted rounded-lg"
          />

          <span className="text-foreground font-mono font-semibold text-[11px] w-8 text-right">
            {opacity}%
          </span>
        </div>
      )}
    </div>
  );
};

export default VisualDiffViewer;
