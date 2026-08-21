"use client";

import React, { memo } from "react";
import { Eye, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { SkillLevel } from "./PresetSelector";
import { TaskScope } from "./ChallengeInfoForm";

interface CandidateLiveSimulationProps {
  imagePreviewUrl: string | null;
  title: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  minimumMatchingScore: number;
  instructions: string;
  onPublish: () => void;
  isSubmitting?: boolean;
}

export const CandidateLiveSimulation = memo(
  ({
    imagePreviewUrl,
    title,
    skillLevel,
    scope,
    minimumMatchingScore,
    instructions,
    onPublish,
    isSubmitting = false,
  }: CandidateLiveSimulationProps) => {
    return (
      <div className="sticky top-24 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            <Eye className="w-4 h-4 text-tomato-500" />
            <span>Live Candidate Preview</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            400 × 300 px
          </span>
        </div>

        {/* Target Simulation Container */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4 flex flex-col items-center">
          {/* 400x300 Canvas */}
          <div className="w-[400px] h-[300px] bg-white rounded-xl shadow-xs overflow-hidden relative border border-border flex items-center justify-center select-none shrink-0">
            {imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreviewUrl}
                alt="Target Simulation"
                className="w-[400px] h-[300px] object-cover pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-2 p-6 text-muted-foreground">
                <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                <span className="text-xs font-semibold text-foreground">
                  No Target Image Loaded
                </span>
                <span className="text-[11px] text-muted-foreground max-w-[200px]">
                  Upload an image or generate one from HTML/CSS to view the live
                  preview.
                </span>
              </div>
            )}
          </div>

          {/* Simulation Meta Card */}
          <div className="w-[400px] space-y-3">
            <div className="p-3.5 bg-card rounded-xl border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm truncate max-w-[260px]">
                  {title || "Target #1: Simply Square"}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-card text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                  {skillLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>
                  Scope: <strong className="text-foreground">{scope}</strong>
                </span>
                <span>
                  Target:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ≥ {minimumMatchingScore}%
                  </strong>
                </span>
              </div>
            </div>

            {instructions && (
              <div className="p-3 bg-card rounded-xl border border-border text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block mb-1">
                  Instructions:
                </span>
                <p className="line-clamp-3">{instructions}</p>
              </div>
            )}

            {/* Publish Action Button */}
            <button
              type="button"
              onClick={onPublish}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-tomato-500 hover:bg-tomato-600 active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Publish Challenge</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CandidateLiveSimulation.displayName = "CandidateLiveSimulation";
export default CandidateLiveSimulation;
