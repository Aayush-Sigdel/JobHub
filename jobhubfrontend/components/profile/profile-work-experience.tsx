"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Briefcase, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/lib/actions/user";

export interface ExperienceDto {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  description?: string;
}

const experienceSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    company: z.string().min(2, "Company must be at least 2 characters"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    endDate: z.string().optional().or(z.literal("")),
    isCurrentRole: z.boolean(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrentRole && !data.endDate) return false;
      return true;
    },
    {
      message: "End date is required if not currently working here",
      path: ["endDate"],
    }
  );

type ExperienceFormValues = z.infer<typeof experienceSchema>;

function toInstant(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export function ProfileWorkExperience({
  experiences = [],
}: {
  experiences?: ExperienceDto[];
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      description: "",
    },
  });
  const isCurrentRole = useWatch({
    control: form.control,
    name: "isCurrentRole",
  });

  const onSubmit = (data: ExperienceFormValues) => {
    const payload = {
      ...data,
      startDate: toInstant(data.startDate),
      endDate:
        data.isCurrentRole || !data.endDate ? undefined : toInstant(data.endDate),
    };

    startTransition(async () => {
      try {
        if (editingId) {
          await updateExperienceAction(editingId, payload);
          toast.success("Experience updated successfully");
        } else {
          await createExperienceAction(payload);
          toast.success("Experience added successfully");
        }
        closeDialog();
        router.refresh();
      } catch {
        toast.error("Failed to save experience");
      }
    });
  };

  const handleEdit = (exp: ExperienceDto) => {
    setEditingId(exp.id);
    form.reset({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate ? exp.startDate.split("T")[0] : "",
      endDate: exp.endDate ? exp.endDate.split("T")[0] : "",
      isCurrentRole: exp.isCurrentRole ?? false,
      description: exp.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      startTransition(async () => {
        try {
          await deleteExperienceAction(id);
          toast.success("Experience deleted successfully");
          router.refresh();
        } catch {
          toast.error("Failed to delete experience");
        }
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      description: "",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Briefcase className="w-5 h-5 text-primary" />
          Work Experience
        </h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </div>

      <div className="space-y-6">
        {experiences.length === 0 ? (
          <p className="text-sm text-muted-foreground">No work experience added yet.</p>
        ) : (
          experiences.map((exp: ExperienceDto) => (
            <div
              key={exp.id}
              className="group relative border-l-2 border-border pl-4 pb-6 last:pb-0"
            >
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-card" />
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {exp.title}
                  </h3>
                  <p className="font-medium text-foreground/80">{exp.company}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {exp.startDate
                        ? format(parseISO(exp.startDate), "MMM yyyy")
                        : "N/A"}{" "}
                      -{" "}
                      {exp.isCurrentRole
                        ? "Present"
                        : exp.endDate
                        ? format(parseISO(exp.endDate), "MMM yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(exp)}
                    disabled={isPending}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exp.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Add"} Work Experience
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date (YYYY-MM-DD)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isCurrentRole}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isCurrentRole"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I currently work here</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you do?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
