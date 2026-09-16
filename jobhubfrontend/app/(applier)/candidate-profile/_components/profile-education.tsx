"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  GraduationCap,
  Calendar,
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
} from "@/lib/actions/user";
import type { EducationDto } from "@/types/api/user";

interface ProfileEducationProps {
  educations?: EducationDto[];
}

interface EducationFormData {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

const INITIAL_FORM: EducationFormData = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  description: "",
};

function toInstant(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) return dateStr;
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function toDateInput(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    return format(parseISO(isoStr), "yyyy-MM-dd");
  } catch {
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return isoStr;
    return "";
  }
}

function formatDisplayDate(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    return format(parseISO(isoStr), "yyyy");
  } catch {
    return isoStr;
  }
}

export function ProfileEducation({
  educations = [],
}: ProfileEducationProps) {
  const router = useRouter();
  const [items, setItems] = useState<EducationDto[]>(educations);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EducationFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setEditingId(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (edu: EducationDto) => {
    setFormData({
      institution: edu.institution || "",
      degree: edu.degree || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      startDate: toDateInput(edu.startDate),
      endDate: toDateInput(edu.endDate),
      description: edu.description || "",
    });
    setErrors({});
    setIsAddOpen(false);
    setEditingId(edu.id);
  };

  const handleCloseForm = () => {
    setIsAddOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!formData.institution.trim() || formData.institution.trim().length < 2) {
      nextErrors.institution = "Institution must be at least 2 characters.";
    }
    if (!formData.degree.trim() || formData.degree.trim().length < 2) {
      nextErrors.degree = "Degree must be at least 2 characters.";
    }
    if (!formData.fieldOfStudy.trim() || formData.fieldOfStudy.trim().length < 2) {
      nextErrors.fieldOfStudy = "Field of study must be at least 2 characters.";
    }
    if (!formData.startDate) {
      nextErrors.startDate = "Start date is required.";
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      nextErrors.endDate = "End date cannot be earlier than start date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    startTransition(async () => {
      try {
        const payload = {
          institution: formData.institution.trim(),
          degree: formData.degree.trim(),
          fieldOfStudy: formData.fieldOfStudy.trim(),
          startDate: toInstant(formData.startDate),
          endDate: formData.endDate ? toInstant(formData.endDate) : undefined,
          description: formData.description.trim() || undefined,
        };

        if (editingId) {
          await updateEducationAction(editingId, payload);
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? {
                    ...item,
                    ...payload,
                    id: editingId,
                  }
                : item
            )
          );
          toast.success("Education updated.");
        } else {
          const created = await createEducationAction(payload);
          const newItem: EducationDto = created?.id
            ? created
            : {
                id: Math.random().toString(),
                ...payload,
              };
          setItems((prev) => [newItem, ...prev]);
          toast.success("Education added.");
        }

        handleCloseForm();
        router.refresh();
      } catch (err) {
        console.error("Failed to save education:", err);
        toast.error(
          err instanceof Error ? err.message : "Unable to save education."
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteEducationAction(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) handleCloseForm();
        toast.success("Education removed.");
        router.refresh();
      } catch (err) {
        console.error("Failed to delete education:", err);
        toast.error("Failed to remove education.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const renderForm = (isEditing: boolean) => (
    <motion.div
      variants={accordionVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={isEditing ? "my-4" : "mb-6"}
    >
      <div className="border border-border rounded-2xl p-5 sm:p-6 bg-card shadow-xs space-y-4">
        {/* Form Title & Close Button */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            {isEditing ? (
              <Pencil className="w-4.5 h-4.5 text-foreground" />
            ) : (
              <GraduationCap className="w-4.5 h-4.5 text-foreground" />
            )}
            <span>{isEditing ? "Edit Education" : "Add Education"}</span>
          </div>
          <button
            type="button"
            onClick={handleCloseForm}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Institution Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            School / Institution <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Kathmandu University, Stanford University"
            value={formData.institution}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, institution: e.target.value }))
            }
            className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium"
          />
          {errors.institution && (
            <p className="text-xs text-destructive font-medium">{errors.institution}</p>
          )}
        </div>

        {/* Degree & Field of Study */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Degree <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Bachelor of Science"
              value={formData.degree}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, degree: e.target.value }))
              }
              className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium"
            />
            {errors.degree && (
              <p className="text-xs text-destructive font-medium">{errors.degree}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Field of Study <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Computer Science"
              value={formData.fieldOfStudy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fieldOfStudy: e.target.value }))
              }
              className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium"
            />
            {errors.fieldOfStudy && (
              <p className="text-xs text-destructive font-medium">
                {errors.fieldOfStudy}
              </p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Start Date <span className="text-destructive">*</span>
            </label>
            <DatePicker
              label="Start date"
              value={formData.startDate}
              error={errors.startDate}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, startDate: value }))
              }
            />
            {errors.startDate && (
              <p className="text-xs text-destructive font-medium">
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              End Date (or Expected)
            </label>
            <DatePicker
              label="End date"
              value={formData.endDate}
              error={errors.endDate}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, endDate: value }))
              }
            />
            {errors.endDate && (
              <p className="text-xs text-destructive font-medium">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Description & Honors (Optional)
          </label>
          <Textarea
            rows={3}
            placeholder="Academic honors, relevant coursework, extracurricular activities, thesis topic..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="rounded-xl border-border bg-background p-3 text-sm focus-visible:ring-primary/40 leading-relaxed resize-y font-normal"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
          <button
            type="button"
            disabled={isPending}
            onClick={handleCloseForm}
            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all border border-border cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="px-5 py-2 text-sm font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Check className="w-4 h-4 text-black stroke-[3]" />
            )}
            <span>{isEditing ? "Save Changes" : "Save Education"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
            <GraduationCap className="h-4.5 w-4.5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Education</h2>
            <p className="text-xs text-muted-foreground font-medium">
              Academic background, degrees, and institutions
            </p>
          </div>
        </div>

        {!isAddOpen && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl border border-border/80 hover:bg-muted text-foreground text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Education</span>
          </button>
        )}
      </div>

      {/* Inline Expanding Add Box */}
      <AnimatePresence>{isAddOpen && renderForm(false)}</AnimatePresence>

      {/* Timeline List */}
      <div className="space-y-6">
        {items.length === 0 && !isAddOpen ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10">
            <p className="text-sm font-semibold text-foreground">
              No education history added yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Add your degrees, certifications, or universities attended to complete your profile.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4 text-black" />
              <span>Add Your Education</span>
            </button>
          </div>
        ) : (
          items.map((edu) => {
            const isEditingThis = editingId === edu.id;

            if (isEditingThis) {
              return <div key={edu.id}>{renderForm(true)}</div>;
            }

            return (
              <div
                key={edu.id}
                className="group relative border-l-2 border-border/80 ml-2.5 pl-5 pb-6 last:pb-1"
              >
                {/* Timeline Dot with Brand Green Indicator */}
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-xs" />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-[17px] font-bold text-foreground leading-snug">
                      {edu.institution}
                    </h3>
                    <p className="text-sm font-semibold text-foreground/85 mt-0.5">
                      {edu.degree}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                      <span>
                        {formatDisplayDate(edu.startDate) || "N/A"} -{" "}
                        {formatDisplayDate(edu.endDate) || "Present"}
                      </span>
                    </div>

                    {edu.description && (
                      <p className="mt-2.5 whitespace-pre-wrap text-sm text-muted-foreground font-normal leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 shrink-0 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(edu)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Edit education"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(edu.id)}
                      disabled={isPending && deletingId === edu.id}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Remove education"
                    >
                      {isPending && deletingId === edu.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
