"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PostTaskHeader from "@/components/task/post/PostTaskHeader";
import PresetSelector, {
  POSTER_PRESETS,
  SkillLevel,
  TaskPreset,
} from "@/components/task/post/PresetSelector";
import ChallengeInfoForm, {
  TaskScope,
} from "@/components/task/post/ChallengeInfoForm";
import EvaluationCriteriaForm from "@/components/task/post/EvaluationCriteriaForm";
import TargetDefinitionForm, {
  CreationMode,
} from "@/components/task/post/TargetDefinitionForm";
import CandidateLiveSimulation from "@/components/task/post/CandidateLiveSimulation";
import { createDesignTaskAction } from "@/lib/actions/tasks";

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
  const [targetHtmlCode, setTargetHtmlCode] = useState<string>(
    POSTER_PRESETS[0].html
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);

  // Convert HTML/CSS Code directly into a 400x300 PNG File
  const rasterizeCodeToPng = useCallback(
    (code: string): Promise<{ file: File; url: string }> => {
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
        const blob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
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
            const file = new File([pngBlob], "target-400x300.png", {
              type: "image/png",
            });
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
    },
    []
  );

  // Sync initial code mode preview on mount
  useEffect(() => {
    if (mode === "code") {
      rasterizeCodeToPng(targetHtmlCode)
        .then(({ file, url }) => {
          setSelectedFile(file);
          setImagePreviewUrl(url);
          setImageDimensions({ width: 400, height: 300 });
        })
        .catch(() => {
          // ignore initial render error
        });
    }
  }, [mode, targetHtmlCode, rasterizeCodeToPng]);

  // Apply a preset template
  const handleApplyPreset = (preset: TaskPreset) => {
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
          `Image is ${width}×${height}px. Challenge requires 400×300px. Click 'Auto-Fit to 400×300' below.`
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

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please enter a challenge title.");
      return;
    }

    let fileToSubmit = selectedFile;

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

    if (
      imageDimensions &&
      (imageDimensions.width !== 400 || imageDimensions.height !== 300)
    ) {
      toast.error(
        "Target image must be exactly 400 × 300 px. Please click 'Auto-Fit to 400×300'."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("image", fileToSubmit);
      formData.set("minimumMatchingScore", String(minimumMatchingScore));
      formData.set("instructions", instructions.trim());
      formData.set("skillLevel", skillLevel);
      formData.set("scope", scope);

      await createDesignTaskAction(formData);
      setIsSubmitting(false);
      toast.success(`CSS Battle Challenge "${title}" published successfully!`);
      router.push("/manage-jobs");
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error instanceof Error ? error.message : "Unable to publish the challenge.");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Top Breadcrumb & Page Header */}
      <PostTaskHeader onPublish={handlePublish} isSubmitting={isSubmitting} />

      {/* 2. Quick Starter Templates */}
      <PresetSelector onSelectPreset={handleApplyPreset} />

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Challenge Info */}
          <ChallengeInfoForm
            title={title}
            onTitleChange={setTitle}
            skillLevel={skillLevel}
            onSkillLevelChange={setSkillLevel}
            scope={scope}
            onScopeChange={setScope}
          />

          {/* Card 2: Passing Criteria & Instructions */}
          <EvaluationCriteriaForm
            minimumMatchingScore={minimumMatchingScore}
            onMinimumMatchingScoreChange={setMinimumMatchingScore}
            instructions={instructions}
            onInstructionsChange={setInstructions}
          />

          {/* Card 3: Target Definition (Upload vs Live Code) */}
          <TargetDefinitionForm
            mode={mode}
            onModeChange={setMode}
            selectedFile={selectedFile}
            imageDimensions={imageDimensions}
            onFileSelect={processImageFile}
            onAutoFitImage={handleAutoFitImage}
            targetHtmlCode={targetHtmlCode}
            onTargetHtmlCodeChange={setTargetHtmlCode}
            onGeneratePngFromCode={handleGeneratePngFromCode}
            isGeneratingPng={isGeneratingPng}
          />
        </div>

        {/* Right Column: Live Candidate Arena Simulation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CandidateLiveSimulation
            imagePreviewUrl={imagePreviewUrl}
            title={title}
            skillLevel={skillLevel}
            scope={scope}
            minimumMatchingScore={minimumMatchingScore}
            instructions={instructions}
            onPublish={handlePublish}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
