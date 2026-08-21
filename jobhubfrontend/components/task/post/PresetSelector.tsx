"use client";

import React, { memo } from "react";
import { Wand2 } from "lucide-react";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

export interface TaskPreset {
  name: string;
  level: SkillLevel;
  score: number;
  instructions: string;
  html: string;
}

export const POSTER_PRESETS: TaskPreset[] = [
  {
    name: "Centered Rounded Badge",
    level: "BEGINNER",
    score: 90,
    instructions:
      "Recreate the centered rounded square with border using pure HTML & CSS. Ensure exact 400×300px dimensions, matching colors, and proper centering.",
    html: `<div class="square"></div>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 400px;
    height: 300px;
    background: #5d3a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .square {
    width: 140px;
    height: 140px;
    background: #e3516e;
    border-radius: 20px;
    border: 10px solid #f7b707;
  }
</style>`,
  },
  {
    name: "Geometric Cross Banner",
    level: "INTERMEDIATE",
    score: 92,
    instructions:
      "Recreate the centered geometric cross with overlapping bars on a solid canvas. Pay close attention to the border radiuses and color boundaries.",
    html: `<div class="container">
  <div class="top-bar"></div>
  <div class="left-bar"></div>
  <div class="center-cross"></div>
  <div class="right-bar"></div>
  <div class="bottom-bar"></div>
</div>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 400px;
    height: 300px;
    background: #ffffff;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .container {
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .center-cross {
    width: 120px;
    height: 120px;
    background: #394257;
    border-radius: 36px;
    position: absolute;
  }
  .top-bar, .bottom-bar {
    position: absolute;
    width: 60px;
    height: 24px;
    background: #d9bb61;
  }
  .top-bar { top: 0; }
  .bottom-bar { bottom: 0; }
  .left-bar, .right-bar {
    position: absolute;
    width: 24px;
    height: 60px;
    background: #d9bb61;
  }
  .left-bar { left: 0; }
  .right-bar { right: 0; }
</style>`,
  },
  {
    name: "Triple Concentric Rings",
    level: "EXPERT",
    score: 95,
    instructions:
      "Recreate the concentric circular disks with precision alignment, transparent cutouts, and exact contrast tones.",
    html: `<div class="ring outer"><div class="ring middle"><div class="ring inner"></div></div></div>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 400px;
    height: 300px;
    background: #191919;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ring {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .outer {
    width: 180px;
    height: 180px;
    background: #f15641;
  }
  .middle {
    width: 120px;
    height: 120px;
    background: #191919;
  }
  .inner {
    width: 60px;
    height: 60px;
    background: #f7b707;
  }
</style>`,
  },
];

interface PresetSelectorProps {
  onSelectPreset: (preset: TaskPreset) => void;
}

export const PresetSelector = memo(({ onSelectPreset }: PresetSelectorProps) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Wand2 className="w-4 h-4 text-tomato-500" />
          <span>Quick Starter Presets</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Click any preset to prefill and preview immediately
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {POSTER_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted active:scale-[0.98] transition-all text-left flex flex-col justify-between gap-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground group-hover:text-tomato-500 transition-colors">
                {preset.name}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-card border border-border">
                {preset.level}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground line-clamp-1">
              Target Score: ≥ {preset.score}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

PresetSelector.displayName = "PresetSelector";
export default PresetSelector;
