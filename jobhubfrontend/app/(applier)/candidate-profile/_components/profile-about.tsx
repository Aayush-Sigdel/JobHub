"use client";
import { Pencil, Check, Copy, Plus, Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileAboutProps {
  about?: string;
}

export function ProfileAbout({ about = "" }: ProfileAboutProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [aboutText, setAboutText] = useState(about);
  const [draftText, setDraftText] = useState(aboutText);
  const [copied, setCopied] = useState(false);

  const MAX_CHARS = 500;

  const handleEdit = () => {
    setDraftText(aboutText);
    setIsEditing(true);
  };

  const handleSave = () => {
    setAboutText(draftText.trim());
    setIsEditing(false);
    // TODO: Trigger API save here
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accordionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground ">About</h2>

        <AnimatePresence mode="wait">
          {!isEditing && aboutText && (
            <motion.button
              key="edit-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleEdit}
              className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-accent rounded-full transition-colors"
              aria-label="Edit about section"
            >
              <Pencil size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-mode"
            variants={accordionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-info/10 text-info border border-info/20 rounded-lg">
                <Info size={18} className="mt-0.5 shrink-0" />
                <p className="text-[13px] font-medium leading-relaxed">
                  Add details about your expertise and the services you offer to
                  help clients get to know you better.
                </p>
              </div>

              <div className="border border-border rounded-lg focus-within:border-ring focus-within:ring-1 focus-within:ring-inset focus-within:ring-ring transition-shadow bg-background overflow-hidden">
                <textarea
                  value={draftText}
                  onChange={(e) =>
                    setDraftText(e.target.value.slice(0, MAX_CHARS))
                  }
                  className="w-full min-h-30 p-4 bg-transparent text-foreground focus:outline-none resize-y text-[14px] leading-relaxed placeholder:text-muted-foreground dark:placeholder:text-muted-foreground"
                  placeholder="Introduce yourself..."
                />

                <div className="flex items-center justify-between px-3 py-2 border-t border-input dark:border-border bg-transparent">
                  <button
                    onClick={handleCopy}
                    disabled={!draftText}
                    className="p-1.5 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground rounded-md transition-colors disabled:opacity-50"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <span className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
                    {draftText.length} / {MAX_CHARS}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 text-[14px] font-medium text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 text-[14px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check size={16} /> Save
                </button>
              </div>
            </div>
          </motion.div>
        ) : aboutText ? (
          <motion.div
            key="view-mode"
            variants={accordionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="text-foreground/80 dark:text-foreground/80 text-[14px] leading-relaxed whitespace-pre-wrap">
              {aboutText}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            variants={accordionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-start gap-4 pb-2">
              <p className="text-[14px] text-muted-foreground dark:text-muted-foreground">
                Introduce yourself to clients by adding a quick summary of your
                expertise and background.
              </p>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-foreground/90 dark:text-foreground dark:border-border hover:bg-muted dark:hover:bg-accent rounded-lg transition-colors"
              >
                <Plus size={16} /> Add about
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
