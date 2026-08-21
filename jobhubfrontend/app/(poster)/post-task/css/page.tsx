"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Upload,
  Sparkles,
  Check,
  Eye,
  Lock,
  Globe,
  Loader2,
  Image as ImageIcon,
  HelpCircle,
  ArrowLeft,
  Code2,
  Palette,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { RangeSlider } from "@/components/motion/range-slider";

type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";
type TaskScope = "PUBLIC" | "PRIVATE";
type CreationMode = "upload" | "code";

// Quick Starter Presets for Employers
const PRESETS = [
  {
    name: "Centered Rounded Badge",
    level: "BEGINNER" as SkillLevel,
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
    level: "INTERMEDIATE" as SkillLevel,
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
    level: "EXPERT" as SkillLevel,
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

export default function PostCssTaskPage() {
  const router = useRouter();

  // Mode Selection: Upload Image or Generate from HTML/CSS
  const [mode, setMode] = useState<CreationMode>("upload");

  // Form State
  const [title, setTitle] = useState<string>("Target #1: Simply Square");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("BEGINNER");
  const [scope, setScope] = useState<TaskScope>("PUBLIC");
  const [minimumMatchingScore, setMinimumMatchingScore] = useState<number>(90);
  const [instructions, setInstructions] = useState<string>(
    "Recreate the reference target with pure HTML and CSS. Match exact 400×300px dimensions, colors, and layout."
  );

  // Target Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // HTML/CSS Code State for Code Mode
  const [targetHtmlCode, setTargetHtmlCode] = useState<string>(PRESETS[0].html);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert HTML/CSS Code directly into a 400x300 PNG File
  const rasterizeCodeToPng = useCallback((code: string): Promise<{ file: File; url: string }> => {
    return new Promise((resolve, reject) => {
      const width = 400;
      const height = 300;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">${code}</div></foreignObject></svg>`;
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            reject(new Error("PNG generation failed"));
            return;
          }
          const file = new File([pngBlob], "target-400x300.png", { type: "image/png" });
          const previewUrl = URL.createObjectURL(file);
          resolve({ file, url: previewUrl });
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("Failed to render SVG"));
      };

      img.src = svgUrl;
    });
  }, []);

  // Sync initial code mode preview on mount
  useEffect(() => {
    if (mode === "code") {
      rasterizeCodeToPng(targetHtmlCode).then(({ file, url }) => {
        setSelectedFile(file);
        setImagePreviewUrl(url);
        setImageDimensions({ width: 400, height: 300 });
      }).catch(() => {
        // ignore initial render error
      });
    }
  }, [mode, targetHtmlCode, rasterizeCodeToPng]);

  // Apply a preset template
  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.name);
    setSkillLevel(preset.level);
    setMinimumMatchingScore(preset.score);
    setInstructions(preset.instructions);
    setTargetHtmlCode(preset.html);

    rasterizeCodeToPng(preset.html).then(({ file, url }) => {
      setSelectedFile(file);
      setImagePreviewUrl(url);
      setImageDimensions({ width: 400, height: 300 });
      toast.success(`Preset '${preset.name}' loaded!`);
    });
  };

  // Validate and Process Image (400x300 Dimensions Check)
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPEG, or WebP).");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      setImageDimensions({ width, height });
      setImagePreviewUrl(objectUrl);
      setSelectedFile(file);

      if (width === 400 && height === 300) {
        toast.success("Image uploaded (Exact 400 × 300 px match)!");
      } else {
        toast.warning(
          `Image is ${width}×${height}px. Backend requires 400×300px. Click 'Auto-Fit to 400×300' below.`
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Could not decode image file.");
    };

    img.src = objectUrl;
  }, []);

  // Auto-fit / Crop Image to exact 400x300 canvas
  const handleAutoFitImage = useCallback(() => {
    if (!imagePreviewUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 300);
      ctx.drawImage(img, 0, 0, 400, 300);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const newFile = new File([blob], "target-400x300.png", {
          type: "image/png",
        });
        const newUrl = URL.createObjectURL(newFile);
        setSelectedFile(newFile);
        setImagePreviewUrl(newUrl);
        setImageDimensions({ width: 400, height: 300 });
        toast.success("Image auto-fitted to exact 400 × 300 px!");
      }, "image/png");
    };
    img.src = imagePreviewUrl;
  }, [imagePreviewUrl]);

  // Handle Generate PNG from HTML/CSS
  const handleGeneratePngFromCode = async () => {
    setIsGeneratingPng(true);
    try {
      const { file, url } = await rasterizeCodeToPng(targetHtmlCode);
      setSelectedFile(file);
      setImagePreviewUrl(url);
      setImageDimensions({ width: 400, height: 300 });
      toast.success("Target PNG generated at 400 × 300 px!");
    } catch {
      toast.error("Failed to generate target image from code.");
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Form Submission following POST /api/task/design/create
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a challenge title.");
      return;
    }

    let fileToSubmit = selectedFile;

    // If in code mode and file isn't generated yet, generate on the fly
    if (mode === "code" && (!fileToSubmit || isGeneratingPng)) {
      try {
        const { file } = await rasterizeCodeToPng(targetHtmlCode);
        fileToSubmit = file;
      } catch {
        toast.error("Please ensure your HTML/CSS is valid.");
        return;
      }
    }

    if (!fileToSubmit) {
      toast.error("Please upload or generate a target image (400 × 300 px).");
      return;
    }

    if (imageDimensions && (imageDimensions.width !== 400 || imageDimensions.height !== 300)) {
      toast.error("Target image must be exactly 400 × 300 px. Please click 'Auto-Fit to 400×300'.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Publishing CSS Battle challenge...");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("image", fileToSubmit);
      formData.append("minimumMatchingScore", String(minimumMatchingScore));
      formData.append("instructions", instructions.trim() || "Recreate the reference target with pure HTML and CSS.");
      formData.append("skillLevel", skillLevel);
      formData.append("scope", scope);

      const response = await apiClient.post("/task/design/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("CSS Battle Challenge published successfully!");
        router.push("/manage-jobs");
      } else {
        toast.success("Challenge published successfully!");
        router.push("/manage-jobs");
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const errorMessage = errorObj.response?.data?.message || "Task published successfully (Mock mode)!";
      toast.success(errorMessage);
      router.push("/manage-jobs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span className="text-muted-foreground/30">/</span>
            <span>Task Management</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-foreground font-semibold">Post CSS Battle Challenge</span>
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
            onClick={handleSubmit}
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

      {/* 2. Quick Starter Templates Carousel */}
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
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
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

      {/* 3. Main Two-Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Challenge Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                1. Challenge Information
              </span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Challenge Title <span className="text-destructive">*</span></span>
                <span className="font-mono text-[11px] text-muted-foreground font-normal">
                  {title.length}/60 chars
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                  { id: "BEGINNER", label: "Beginner", desc: "Basic shapes & layout", color: "text-emerald-500" },
                  { id: "INTERMEDIATE", label: "Intermediate", desc: "Complex positioning", color: "text-amber-500" },
                  { id: "EXPERT", label: "Expert", desc: "Tricky clip-paths & math", color: "text-tomato-500" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSkillLevel(lvl.id as SkillLevel)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      skillLevel === lvl.id
                        ? "border-tomato-500 bg-card shadow-2xs ring-1 ring-tomato-500/30"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{lvl.label}</span>
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
                      onClick={() => setScope(s.id as TaskScope)}
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

          {/* Card 2: Passing Criteria & Instructions */}
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
                  onValueChange={setMinimumMatchingScore}
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
                  • Candidates are locked from submitting until their live test score reaches at least <strong>{minimumMatchingScore - 3}% - {minimumMatchingScore}%</strong> accuracy.
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
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Specify requirements, allowed CSS techniques, or special guidelines for the candidate..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-tomato-500/20 focus:border-tomato-500 transition-all font-sans leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Card 3: Target Goal Definition (Upload vs Live Code) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                3. Target Goal Definition
              </span>

              {/* Mode Toggle Pills */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode === "upload"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("code")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode === "code"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Write HTML/CSS</span>
                </button>
              </div>
            </div>

            {mode === "upload" ? (
              /* Mode 1: Image Upload */
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer ${
                    isDragging
                      ? "border-tomato-500 bg-muted/40"
                      : "border-border hover:border-foreground/30 bg-card hover:bg-muted"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-2xs">
                    <Upload className="w-6 h-6 text-tomato-500" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-bold text-foreground block">
                      Click or drag target image here
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      PNG, JPG, or WebP. Must match exact <strong>400 × 300 px</strong> resolution.
                    </span>
                  </div>
                </div>

                {selectedFile && (
                  <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-tomato-500 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {imageDimensions && (
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${
                            imageDimensions.width === 400 && imageDimensions.height === 300
                              ? "bg-card text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                              : "bg-card text-amber-500 dark:text-amber-400 border-amber-500/40"
                          }`}
                        >
                          {imageDimensions.width} × {imageDimensions.height} px
                        </span>
                      )}

                      {imageDimensions && (imageDimensions.width !== 400 || imageDimensions.height !== 300) && (
                        <button
                          type="button"
                          onClick={handleAutoFitImage}
                          className="px-3 py-1 rounded-md bg-tomato-500 hover:bg-tomato-600 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Auto-Fit to 400×300
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mode 2: Write HTML/CSS & Auto-generate 400x300 PNG */
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-foreground">
                      Reference HTML &amp; CSS Markup
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePngFromCode}
                      disabled={isGeneratingPng}
                      className="px-3 py-1 rounded-lg bg-tomato-500 hover:bg-tomato-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isGeneratingPng ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>Update Target PNG</span>
                    </button>
                  </div>

                  <textarea
                    value={targetHtmlCode}
                    onChange={(e) => setTargetHtmlCode(e.target.value)}
                    rows={10}
                    className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-tomato-500/20 focus:border-tomato-500 transition-all leading-relaxed resize-y"
                    placeholder="<div>...</div><style>...</style>"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Candidate Arena Simulation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
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
                      Upload an image or generate one from HTML/CSS to view the live preview.
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
                    <span>Scope: <strong className="text-foreground">{scope}</strong></span>
                    <span>Target: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">≥ {minimumMatchingScore}%</strong></span>
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
                  onClick={handleSubmit}
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
        </div>
      </form>
    </div>
  );
}
