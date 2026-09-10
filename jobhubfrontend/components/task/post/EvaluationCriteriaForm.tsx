"use client";

import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/post-job/MarkdownEditor";

interface EvaluationCriteriaFormProps {
  minimumMatchingScore: number;
  onMinimumMatchingScoreChange: (score: number) => void;
  disabled?: boolean;
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
}

export default function EvaluationCriteriaForm({
  minimumMatchingScore,
  onMinimumMatchingScoreChange,
  instructions,
  disabled,
  onInstructionsChange,
}: EvaluationCriteriaFormProps) {
  return (
    <section className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold">Instructions & evaluation</h2>
      <div className="space-y-2">
        <Label htmlFor="css-instructions">Candidate instructions</Label>
        <MarkdownEditor
          id="css-instructions"
          value={instructions}
          onChange={onInstructionsChange}
          label="Candidate instructions"
          disabled={disabled}
          placeholder="Describe the target and any constraints or allowed techniques."
        />
      </div>
      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="target-accuracy">Target accuracy</Label>
          <span className="text-lg font-semibold tabular-nums">
            {minimumMatchingScore}%
          </span>
        </div>
        <input
          id="target-accuracy"
          type="range"
          value={minimumMatchingScore}
          onChange={(event) =>
            onMinimumMatchingScoreChange(Number(event.target.value))
          }
          min={50}
          max={100}
          step={5}
          className="h-6 w-full cursor-pointer accent-foreground"
          aria-valuetext={`${minimumMatchingScore}% accuracy`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50% · Flexible</span>
          <span>100% · Exact</span>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          A 3-point tolerance applies. Candidates pass at{" "}
          {minimumMatchingScore - 3}% accuracy or higher.
        </p>
      </div>
    </section>
  );
}
