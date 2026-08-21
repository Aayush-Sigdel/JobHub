"use client";

import React, { memo } from "react";
import { Check, Globe, Lock } from "lucide-react";
import { SkillLevel } from "./PresetSelector";

export type TaskScope = "PUBLIC" | "PRIVATE";

interface ChallengeInfoFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  skillLevel: SkillLevel;
  onSkillLevelChange: (level: SkillLevel) => void;
  scope: TaskScope;
  onScopeChange: (scope: TaskScope) => void;
}

export const ChallengeInfoForm = memo(
  ({
    title,
    onTitleChange,
    skillLevel,
    onSkillLevelChange,
    scope,
    onScopeChange,
  }: ChallengeInfoFormProps) => {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            1. Challenge Information
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>
              Challenge Title <span className="text-destructive">*</span>
            </span>
            <span className="font-mono text-[11px] text-muted-foreground font-normal">
              {title.length}/60 chars
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            maxLength={60}
            placeholder="e.g., Target #1: Simply Square"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-tomato-500/20 focus:border-tomato-500 transition-all font-sans"
          />
        </div>

        {/* Skill Level Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Skill Level <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: "BEGINNER",
                label: "Beginner",
                desc: "Basic shapes & layout",
                color: "text-emerald-500",
              },
              {
                id: "INTERMEDIATE",
                label: "Intermediate",
                desc: "Complex positioning",
                color: "text-amber-500",
              },
              {
                id: "EXPERT",
                label: "Expert",
                desc: "Tricky clip-paths & math",
                color: "text-tomato-500",
              },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onSkillLevelChange(lvl.id as SkillLevel)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  skillLevel === lvl.id
                    ? "border-tomato-500 bg-card shadow-2xs ring-1 ring-tomato-500/30"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">
                    {lvl.label}
                  </span>
                  {skillLevel === lvl.id ? (
                    <Check className="w-3.5 h-3.5 text-tomato-500" />
                  ) : (
                    <span className={`text-[10px] font-bold ${lvl.color}`}>●</span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {lvl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visibility / Scope Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Challenge Scope <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "PUBLIC",
                label: "Public Challenge",
                desc: "Visible in candidate challenges discovery",
                icon: Globe,
              },
              {
                id: "PRIVATE",
                label: "Private Assessment",
                desc: "Restricted to specifically invited applicants",
                icon: Lock,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onScopeChange(s.id as TaskScope)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    scope === s.id
                      ? "border-tomato-500 bg-card shadow-2xs ring-1 ring-tomato-500/30"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      scope === s.id
                        ? "bg-tomato-500 text-white border-tomato-500"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-foreground block">
                      {s.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight block">
                      {s.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ChallengeInfoForm.displayName = "ChallengeInfoForm";
export default ChallengeInfoForm;
