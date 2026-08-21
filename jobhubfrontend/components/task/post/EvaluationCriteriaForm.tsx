"use client";

import React, { memo } from "react";
import { HelpCircle } from "lucide-react";
import { RangeSlider } from "@/components/motion/range-slider";

interface EvaluationCriteriaFormProps {
  minimumMatchingScore: number;
  onMinimumMatchingScoreChange: (score: number) => void;
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
}

export const EvaluationCriteriaForm = memo(
  ({
    minimumMatchingScore,
    onMinimumMatchingScoreChange,
    instructions,
    onInstructionsChange,
  }: EvaluationCriteriaFormProps) => {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            2. Passing Criteria &amp; Instructions
          </span>
        </div>

        {/* Minimum Matching Score Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Required Minimum Match Accuracy
              </label>
              <div
                className="text-muted-foreground hover:text-foreground cursor-help"
                title="Tolerance rule: Candidates pass when achieved score >= minimumMatchingScore - 3%"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-tomato-500 bg-card px-2.5 py-1 rounded-md border border-border">
              ≥ {minimumMatchingScore}% Match
            </span>
          </div>

          {/* beUI RangeSlider */}
          <div className="space-y-1.5">
            <RangeSlider
              value={minimumMatchingScore}
              onValueChange={onMinimumMatchingScoreChange}
              min={50}
              max={100}
              step={5}
              showTicks={true}
              className="h-8"
              aria-label="Required Passing Accuracy"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-1">
              <span>50% (Lenient)</span>
              <span>75%</span>
              <span>90% (Standard)</span>
              <span>100% (Exact)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1">
            <p>
              • Candidates are locked from submitting until their live test score
              reaches at least{" "}
              <strong>
                {minimumMatchingScore - 3}% - {minimumMatchingScore}%
              </strong>{" "}
              accuracy.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Candidate Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            rows={4}
            placeholder="Specify requirements, allowed CSS techniques, or special guidelines for the candidate..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-tomato-500/20 focus:border-tomato-500 transition-all font-sans leading-relaxed resize-none"
          />
        </div>
      </div>
    );
  }
);

EvaluationCriteriaForm.displayName = "EvaluationCriteriaForm";
export default EvaluationCriteriaForm;
