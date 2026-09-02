"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, GraduationCap, Calendar } from "lucide-react";
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
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
} from "@/lib/actions/user";

export interface EducationDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

const educationSchema = z.object({
  institution: z.string().min(2, "Institution must be at least 2 characters"),
  degree: z.string().min(2, "Degree must be at least 2 characters"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  endDate: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

export function ProfileEducation({
  educations = [],
}: {
  educations?: EducationDto[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const onSubmit = (data: EducationFormValues) => {
    const payload = {
      ...data,
      endDate: data.endDate || undefined,
      fieldOfStudy: data.fieldOfStudy || undefined,
      description: data.description || undefined,
    };

    startTransition(async () => {
      try {
        if (editingId) {
          await updateEducationAction(editingId, payload);
          toast.success("Education updated successfully");
        } else {
          await createEducationAction(payload);
          toast.success("Education added successfully");
        }
        closeDialog();
      } catch (error) {
        toast.error("Failed to save education");
      }
    });
  };

  const handleEdit = (edu: EducationDto) => {
    setEditingId(edu.id);
    form.reset({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || "",
      startDate: edu.startDate ? edu.startDate.split("T")[0] : "",
      endDate: edu.endDate ? edu.endDate.split("T")[0] : "",
      description: edu.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this education entry?")) {
      startTransition(async () => {
        try {
          await deleteEducationAction(id);
          toast.success("Education deleted successfully");
        } catch (error) {
          toast.error("Failed to delete education");
        }
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Education
        </h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Education
        </Button>
      </div>

      <div className="space-y-6">
        {educations.length === 0 ? (
          <p className="text-gray-500 text-sm">No education history added yet.</p>
        ) : (
          educations.map((edu: EducationDto) => (
            <div
              key={edu.id}
              className="group relative border-l-2 border-gray-200 pl-4 pb-6 last:pb-0"
            >
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary" />
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {edu.institution}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {edu.degree}
                    {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {edu.startDate
                        ? format(parseISO(edu.startDate), "yyyy")
                        : "N/A"}{" "}
                      -{" "}
                      {edu.endDate
                        ? format(parseISO(edu.endDate), "yyyy")
                        : "Present"}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-gray-600 mt-3 text-sm whitespace-pre-wrap">
                      {edu.description}
                    </p>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(edu)}
                    disabled={isPending}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(edu.id)}
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
              {editingId ? "Edit" : "Add"} Education
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="University Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input placeholder="B.S. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
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
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Achievements, honors, etc."
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
