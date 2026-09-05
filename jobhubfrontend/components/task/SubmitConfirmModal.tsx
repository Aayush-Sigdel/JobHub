"use client";

import React, { memo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Send, Check, ArrowRight, CheckCircle2 } from "lucide-react";
import { DesignTask, ScoreResult } from "@/lib/task/css_data";
import { Button } from "@/components/ui/button";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  task: DesignTask;
  lastScore: ScoreResult | null;
  codeLength: number;
  jobId?: string | null;
  hasSubmittedSuccessfully?: boolean;
  submission?: TaskSubmissionResponse | null;
}

export const SubmitConfirmModal = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
    task,
    lastScore,
    codeLength,
    jobId,
    hasSubmittedSuccessfully,
    submission,
  }: SubmitConfirmModalProps) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              {hasSubmittedSuccessfully ? (
                /* Success View */
                <div className="text-center py-4 space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    CSS Assessment Recorded!
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {submission
                      ? `Server verification recorded ${submission.achievedScore} / ${submission.requiredScore}. ${submission.passed ? "The assessment passed." : "The result is available to the recruiter."}`
                      : "Your CSS submission has been saved for this application."}
                  </p>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    {jobId && (
                      <Button asChild className="w-full sm:w-auto rounded-xl font-bold text-xs h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href={`/find-job/${jobId}`}>
                          <span>Return to Job Application</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full sm:w-auto rounded-xl font-bold text-xs h-10"
                    >
                      Stay in IDE
                    </Button>
                  </div>
                </div>
              ) : (
                /* Confirmation View */
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted text-primary flex items-center justify-center shrink-0 border border-border">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Submit Final Assessment?
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {jobId
                          ? "Your solution will be evaluated by the server and shared with the recruiter, whether it passes or not."
                          : `Your solution achieved ${lastScore?.matchPct}% match (≥ ${task.minimumMatchingScore}% required).`}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-muted/50 rounded-2xl border border-border text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code Size:</span>
                      <span className="font-mono font-bold text-foreground">
                        {codeLength} characters
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calculated Match Score:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {lastScore ? `${lastScore.score} pts (${lastScore.matchPct}%)` : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground border border-border bg-card hover:bg-muted active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onConfirm}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting..." : "Confirm & Submit"}</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

SubmitConfirmModal.displayName = "SubmitConfirmModal";
export default SubmitConfirmModal;
