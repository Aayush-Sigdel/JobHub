"use client";

import React, { memo, useRef } from "react";
import {
  Code2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";

export type CreationMode = "upload" | "code";

interface TargetDefinitionFormProps {
  mode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  selectedFile: File | null;
  imageDimensions: { width: number; height: number } | null;
  onFileSelect: (file: File) => void;
  onAutoFitImage: () => void;
  targetHtmlCode: string;
  onTargetHtmlCodeChange: (code: string) => void;
  onGeneratePngFromCode: () => void;
  isGeneratingPng: boolean;
}

export const TargetDefinitionForm = memo(
  ({
    mode,
    onModeChange,
    selectedFile,
    imageDimensions,
    onFileSelect,
    onAutoFitImage,
    targetHtmlCode,
    onTargetHtmlCodeChange,
    onGeneratePngFromCode,
    isGeneratingPng,
  }: TargetDefinitionFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    };

    return (
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <h2 className="text-base font-semibold">Reference target</h2>

          {/* Mode Toggle Pills */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => onModeChange("upload")}
              aria-pressed={mode === "upload"}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === "upload"
                  ? "bg-card text-foreground "
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange("code")}
              aria-pressed={mode === "code"}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === "code"
                  ? "bg-card text-foreground "
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
                  onFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border border-dashed rounded-lg p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer ${
                isDragging
                  ? "border-foreground/40 bg-muted/40"
                  : "border-border hover:border-foreground/30 bg-card hover:bg-muted"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground ">
                <Upload className="w-6 h-6 text-foreground" />
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground block">
                  Click or drag target image here
                </span>
                <span className="text-xs text-muted-foreground block">
                  PNG, JPG, or WebP. Must match exact{" "}
                  <strong>400 × 300 px</strong> resolution.
                </span>
              </div>
            </button>

            {selectedFile && (
              <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground block truncate max-w-[200px]">
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
                      className={`font-mono text-xs font-medium px-2.5 py-1 rounded-md border ${
                        imageDimensions.width === 400 &&
                        imageDimensions.height === 300
                          ? "bg-card text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                          : "bg-card text-amber-500 dark:text-amber-400 border-amber-500/40"
                      }`}
                    >
                      {imageDimensions.width} × {imageDimensions.height} px
                    </span>
                  )}

                  {imageDimensions &&
                    (imageDimensions.width !== 400 ||
                      imageDimensions.height !== 300) && (
                      <button
                        type="button"
                        onClick={onAutoFitImage}
                        className="px-3 py-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs transition-all shadow-xs cursor-pointer"
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
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <label
                  htmlFor="target-markup"
                  className="font-medium text-foreground"
                >
                  Reference HTML &amp; CSS Markup
                </label>
                <button
                  type="button"
                  onClick={onGeneratePngFromCode}
                  disabled={isGeneratingPng || !targetHtmlCode.trim()}
                  className="px-3 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
                id="target-markup"
                spellCheck={false}
                value={targetHtmlCode}
                onChange={(e) => onTargetHtmlCodeChange(e.target.value)}
                rows={10}
                className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-foreground/40 transition-all leading-relaxed resize-y"
                placeholder="<div>...</div><style>...</style>"
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);

TargetDefinitionForm.displayName = "TargetDefinitionForm";
export default TargetDefinitionForm;
