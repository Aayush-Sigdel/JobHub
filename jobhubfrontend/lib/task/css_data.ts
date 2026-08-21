/**
 * CSS Battle / Design Task Data Specifications
 * Adheres to JobHub Task Controller API reference (task-controller-api.md)
 */

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface DesignTask {
  id: string;
  title: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  scope: "PUBLIC" | "PRIVATE";
  minimumMatchingScore: number; // e.g. 90.0 (%)
  instructions: string;
  colors: ColorSwatch[];
  targetHtml: string;
  initialCode: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface ScoreResult {
  score: number;
  matchPct: number;
  chars: number;
}

// Backend tolerance threshold rule: achievedScore >= minimumMatchingScore - 3
export const PASSING_TOLERANCE = 3.0;

// Default Beginner CSS Battle Task
export const DEFAULT_CSS_TASK: DesignTask = {
  id: "a6db053d-0336-4cc1-8063-2eb2e0889592",
  title: "Target #1: Simply Square",
  skillLevel: "BEGINNER",
  scope: "PUBLIC",
  minimumMatchingScore: 90.0,
  instructions:
    "Recreate the centered rounded square with border using pure HTML & CSS. Ensure exact 400×300px dimensions, matching colors, and proper centering.",
  viewport: {
    width: 400,
    height: 300,
  },
  colors: [
    { name: "Dark Purple", hex: "#5D3A3A" },
    { name: "Coral Red", hex: "#E3516E" },
    { name: "Warm Gold", hex: "#F7B707" },
  ],
  targetHtml: `<div class="square"></div>
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
  initialCode: `<div></div>
<style>
  body {
    margin: 0;
    background: #5d3a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
  }
  div {
    width: 120px;
    height: 120px;
    background: #e3516e;
    border-radius: 12px;
  }
</style>

<!-- OBJECTIVE -->
<!-- Recreate the given target in pure HTML/CSS. Match colors and dimensions. -->
<!-- Test with 'Test Code' (Ctrl + Enter) -->
<!-- Submit unlocks when Match >= 90% -->`,
};

/**
 * Calculates total point score given match percentage and character count.
 */
export function calculateScorePoints(matchPct: number, chars: number): number {
  const baseScore = matchPct * 2;
  const charBonus = Math.max(0, (600 - chars) * 0.1);
  return parseFloat((baseScore + charBonus).toFixed(1));
}
