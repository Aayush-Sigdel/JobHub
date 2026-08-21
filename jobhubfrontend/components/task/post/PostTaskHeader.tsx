"use client";

import React, { memo } from "react";
import { ArrowLeft, Flame, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostTaskHeaderProps {
  onPublish: () => void;
  isSubmitting?: boolean;
}

export const PostTaskHeader = memo(
  ({ onPublish, isSubmitting = false }: PostTaskHeaderProps) => {
    const router = useRouter();

    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span className="text-muted-foreground/30">/</span>
            <span>Task Management</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-foreground font-semibold">
              Post CSS Battle Challenge
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-tomato-500 shadow-2xs">
              <Flame className="w-4 h-4 fill-tomato-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Create CSS Battle Challenge
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Publish automated pixel-accuracy frontend assessment challenges (400 × 300 px) for job applicants.
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted active:scale-[0.98] transition-all cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onPublish}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-tomato-500 hover:bg-tomato-600 active:scale-[0.98] shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
    );
  }
);

PostTaskHeader.displayName = "PostTaskHeader";
export default PostTaskHeader;
