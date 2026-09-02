"use client";

import React, { useState, useCallback, memo } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { DesignTask } from "@/lib/task/css_data";

interface TargetGoalCanvasProps {
  task: DesignTask & {
    imageBytes?: string;
    imageContentType?: string;
  };
}

function imageDataUrl(imageBytes: string, contentType?: string) {
  return `data:${contentType || "image/png"};base64,${imageBytes}`;
}

export const TargetGoalCanvas = memo(({ task }: TargetGoalCanvasProps) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopiedHex(null), 1500);
  }, []);

  const hasImage = task.imageBytes && task.imageBytes.length > 0;

  return (
    <div className="w-full lg:w-[470px] xl:w-[490px] shrink-0 h-full flex flex-col p-6 select-none overflow-y-auto bg-card">
      {/* 1. Header strictly at top */}
      <div className="flex items-center justify-between pb-3.5 text-xs font-mono text-foreground border-b border-border shrink-0 whitespace-nowrap">
        <span className="font-bold text-sm whitespace-nowrap">
          Recreate this target
        </span>
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {task.viewport.width}px x {task.viewport.height}px
        </span>
      </div>

      {/* 2. 400x300 Static Target Canvas */}
      <div className="flex justify-center py-4 shrink-0">
        <div className="w-[400px] h-[300px] bg-white rounded-2xl shadow-xs overflow-hidden relative border border-border shrink-0 flex items-center justify-center">
          {hasImage ? (
            <img
              src={imageDataUrl(task.imageBytes!, task.imageContentType)}
              alt="Target Design Goal"
              className="w-[400px] h-[300px] object-contain bg-white pointer-events-none"
            />
          ) : (
            <iframe
              title="Target Goal Canvas"
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>* { box-sizing: border-box; } html, body { margin: 0; padding: 0; width: ${task.viewport.width}px; height: ${task.viewport.height}px; overflow: hidden; background: #ffffff; }</style></head><body>${task.targetHtml}</body></html>`}
              className="w-[400px] h-[300px] border-0 pointer-events-none bg-white"
              loading="eager"
            />
          )}
        </div>
      </div>

      {/* 3. Colors Bar & Evaluation Criteria Card */}
      <div className="w-[400px] mx-auto space-y-4 mt-1">
        {/* Colors Section */}
        {task.colors && task.colors.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="font-bold text-foreground">Palette Colors</span>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                CLICK TO COPY
              </span>
              <div className="flex-1 h-[1px] bg-border" />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {task.colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleCopyColor(c.hex)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-muted active:scale-[0.98] border border-border hover:border-foreground/30 text-xs font-mono font-medium text-foreground transition-all shadow-2xs group cursor-pointer"
                  title={`${c.name}: ${c.hex} (Click to copy)`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.hex}</span>
                  {copiedHex === c.hex && (
                    <Check className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Task Info Card */}
        <div className="p-4 bg-card border border-border rounded-2xl text-xs space-y-1.5">
          <span className="font-bold text-foreground block text-xs">
            Evaluation Criteria
          </span>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your submission is evaluated on visual pixel accuracy (
            {task.viewport.width} × {task.viewport.height} px). Reach at least{" "}
            <strong className="text-foreground font-semibold">
              {task.minimumMatchingScore}%
            </strong>{" "}
            match accuracy to unlock submission and attach your result to your job application.
          </p>
        </div>
      </div>
    </div>
  );
});

TargetGoalCanvas.displayName = "TargetGoalCanvas";
export default TargetGoalCanvas;
