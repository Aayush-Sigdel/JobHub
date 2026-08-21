"use client";

import React, { memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send, Check } from "lucide-react";
import { DesignTask, ScoreResult } from "@/lib/task/css_data";

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  task: DesignTask;
  lastScore: ScoreResult | null;
  codeLength: number;
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
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted text-tomato-500 flex items-center justify-center shrink-0 border border-border">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Submit Final Answer?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your solution has met the required score (
                    {lastScore?.matchPct}% ≥ {task.minimumMatchingScore}%). This
                    will submit your final score.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-xl border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code Length:</span>
                  <span className="font-mono font-bold text-foreground">
                    {codeLength} characters
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Score:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {lastScore
                      ? `${lastScore.score} pts (${lastScore.matchPct}%)`
                      : "-"}
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-tomato-500 hover:bg-tomato-600 active:scale-[0.98] shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm &amp; Submit</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

SubmitConfirmModal.displayName = "SubmitConfirmModal";
export default SubmitConfirmModal;
