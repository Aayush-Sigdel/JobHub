"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/lib/actions/user";
import type { ExperienceDto } from "@/types/api/user";

interface ProfileWorkExperienceProps {
  experiences?: ExperienceDto[];
}

interface ExperienceFormData {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
  description: string;
}

const INITIAL_FORM: ExperienceFormData = {
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  isCurrentRole: false,
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
    return format(parseISO(isoStr), "MMM yyyy");
  } catch {
    return isoStr;
  }
}

export function ProfileWorkExperience({
  experiences = [],
}: ProfileWorkExperienceProps) {
  const router = useRouter();
  const [items, setItems] = useState<ExperienceDto[]>(experiences);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(INITIAL_FORM);
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

  const handleOpenEdit = (exp: ExperienceDto) => {
    setFormData({
      title: exp.title || "",
      company: exp.company || "",
      startDate: toDateInput(exp.startDate),
      endDate: toDateInput(exp.endDate),
      isCurrentRole: exp.isCurrentRole ?? (!exp.endDate && !!exp.startDate),
      description: exp.description || "",
    });
    setErrors({});
    setIsAddOpen(false);
    setEditingId(exp.id);
  };

  const handleCloseForm = () => {
    setIsAddOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      nextErrors.title = "Job title must be at least 2 characters.";
    }
    if (!formData.company.trim() || formData.company.trim().length < 2) {
      nextErrors.company = "Company name must be at least 2 characters.";
    }
    if (!formData.startDate) {
      nextErrors.startDate = "Start date is required.";
    }
    if (!formData.isCurrentRole && !formData.endDate) {
      nextErrors.endDate = "End date is required if not your current role.";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      !formData.isCurrentRole &&
      formData.startDate > formData.endDate
    ) {
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
          title: formData.title.trim(),
          company: formData.company.trim(),
          startDate: toInstant(formData.startDate),
          endDate: formData.isCurrentRole || !formData.endDate ? undefined : toInstant(formData.endDate),
          isCurrentRole: formData.isCurrentRole,
          description: formData.description.trim() || undefined,
        };

        if (editingId) {
          await updateExperienceAction(editingId, payload);
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
          toast.success("Work experience updated.");
        } else {
          const created = await createExperienceAction(payload);
          const newItem: ExperienceDto = created?.id
            ? created
            : {
                id: Math.random().toString(),
                ...payload,
              };
          setItems((prev) => [newItem, ...prev]);
          toast.success("Work experience added.");
        }

        handleCloseForm();
        router.refresh();
      } catch (err) {
        console.error("Failed to save experience:", err);
        toast.error(
          err instanceof Error ? err.message : "Unable to save work experience."
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteExperienceAction(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) handleCloseForm();
        toast.success("Work experience removed.");
        router.refresh();
      } catch (err) {
        console.error("Failed to delete experience:", err);
        toast.error("Failed to remove work experience.");
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
              <Briefcase className="w-4.5 h-4.5 text-foreground" />
            )}
            <span>{isEditing ? "Edit Work Experience" : "Add Work Experience"}</span>
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

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Job Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium"
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Company / Employer <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Acme Corp"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium"
            />
            {errors.company && (
              <p className="text-xs text-destructive font-medium">{errors.company}</p>
            )}
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Start Date <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium"
            />
            {errors.startDate && (
              <p className="text-xs text-destructive font-medium">
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              End Date {!formData.isCurrentRole && <span className="text-destructive">*</span>}
            </label>
            <Input
              type="date"
              value={formData.isCurrentRole ? "" : formData.endDate}
              disabled={formData.isCurrentRole}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-sm font-medium disabled:opacity-50 disabled:bg-muted/40"
            />
            {errors.endDate && (
              <p className="text-xs text-destructive font-medium">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Current Role Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 text-sm text-foreground font-medium cursor-pointer select-none">
            <Checkbox
              id="current-role"
              checked={formData.isCurrentRole}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isCurrentRole: !!checked,
                  endDate: checked ? "" : prev.endDate,
                }))
              }
            />
            <span>I currently work here in this role</span>
          </label>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Description & Core Responsibilities
          </label>
          <Textarea
            rows={3}
            placeholder="Highlight your key achievements, notable features delivered, and technical stack used..."
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
            <span>{isEditing ? "Save Changes" : "Save Experience"}</span>
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
            <Briefcase className="h-4.5 w-4.5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Work Experience</h2>
            <p className="text-xs text-muted-foreground font-medium">
              Roles, career highlights, and impact
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
            <span>Add Experience</span>
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
              No work experience added yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Showcase roles and career achievements to boost relevant job recommendations.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4 text-black" />
              <span>Add Your First Role</span>
            </button>
          </div>
        ) : (
          items.map((exp) => {
            const isEditingThis = editingId === exp.id;

            if (isEditingThis) {
              return <div key={exp.id}>{renderForm(true)}</div>;
            }

            return (
              <div
                key={exp.id}
                className="group relative border-l-2 border-border/80 ml-2.5 pl-5 pb-6 last:pb-1"
              >
                {/* Timeline Dot with Brand Green Indicator */}
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-xs" />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-[17px] font-bold text-foreground leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-sm font-semibold text-foreground/85 mt-0.5">
                      {exp.company}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                      <span>
                        {formatDisplayDate(exp.startDate) || "N/A"} -{" "}
                        {exp.isCurrentRole
                          ? "Present"
                          : formatDisplayDate(exp.endDate) || "N/A"}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="mt-2.5 whitespace-pre-wrap text-sm text-muted-foreground font-normal leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 shrink-0 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exp)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Edit experience"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id)}
                      disabled={isPending && deletingId === exp.id}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Remove experience"
                    >
                      {isPending && deletingId === exp.id ? (
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
