import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSkillName(skill: string): string {
  if (!skill) return "";
  const trimmed = skill.trim();
  const lower = trimmed.toLowerCase();
  const map: Record<string, string> = {
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    aws: "AWS",
    api: "API",
    php: "PHP",
    ui: "UI",
    ux: "UX",
    javascript: "JavaScript",
    typescript: "TypeScript",
    nodejs: "Node.js",
    reactjs: "React",
    nextjs: "Next.js",
  };
  return map[lower] || trimmed;
}

export function stripHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

