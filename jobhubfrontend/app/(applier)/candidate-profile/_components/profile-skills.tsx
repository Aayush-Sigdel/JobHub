"use client";

import { useState, useEffect } from "react";
import { Plus, X, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
} from "@/lib/actions/user";

interface SkillItem {
  id?: string;
  name: string;
  level: string;
}

interface ProfileSkillsProps {
  initialSkills?: SkillItem[];
}

export function ProfileSkills({ initialSkills }: ProfileSkillsProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills || []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", level: "Intermediate" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSkills) {
      setSkills(initialSkills);
    }
  }, [initialSkills]);

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", level: "Intermediate" });
    setEditIndex(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setFormData(skills[index]);
    setIsAddOpen(false);
    setEditIndex(index);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      setIsLoading(true);
      const normalizedLevel = (formData.level || "INTERMEDIATE").toUpperCase();

      if (editIndex !== null && skills[editIndex]?.id) {
        const skillId = skills[editIndex].id;
        await updateSkillAction(skillId, {
          name: formData.name.trim(),
          level: normalizedLevel,
        });
        const updated = [...skills];
        updated[editIndex] = { ...formData, id: skillId };
        setSkills(updated);
      } else {
        const createdSkill = await createSkillAction({
          name: formData.name.trim(),
          level: normalizedLevel,
        });
        const finalSkill = createdSkill?.id
          ? createdSkill
          : {
              id: Math.random().toString(),
              name: formData.name.trim(),
              level: formData.level,
            };
        setSkills([finalSkill, ...skills]);
      }

      setIsAddOpen(false);
      setEditIndex(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to save skill:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    const skillToDelete = skills[index];
    try {
      if (skillToDelete.id) {
        await deleteSkillAction(skillToDelete.id);
      }
      const updated = [...skills];
      updated.splice(index, 1);
      setSkills(updated);
      if (editIndex === index) setEditIndex(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete skill:", err);
    }
  };

  const renderForm = (isEditing: boolean) => (
    <motion.div
      variants={accordionVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={isEditing ? "col-span-full mb-4" : "mb-6"}
    >
      <div className="border-2 border-border rounded-xl p-5 bg-card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isEditing ? "Edit skill" : "Add new skill"}
          </div>
          <button
            onClick={() => (isEditing ? setEditIndex(null) : setIsAddOpen(false))}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditing && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2 mb-4">
            <span className="text-blue-500 text-sm mt-0.5">ℹ️</span>
            <p className="text-sm text-foreground/80">
              Adding your specific skills helps make sure the right employers discover your profile.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            placeholder="Add skill or expertise (e.g. React, Python, Docker)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 rounded-lg border-input"
          />

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              Proficiency Level
            </label>
            <div className="flex flex-wrap gap-2">
              {["Beginner", "Intermediate", "Expert"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, level })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    formData.level?.toLowerCase() === level.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => (isEditing ? setEditIndex(null) : setIsAddOpen(false))}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Skills</h2>
        {!isAddOpen && (
          <button
            onClick={handleOpenAdd}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
            aria-label="Add skill"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>{isAddOpen && renderForm(false)}</AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skills.map((skill, index) => {
          if (editIndex === index) {
            return <div key={skill.id || index}>{renderForm(true)}</div>;
          }

          return (
            <div
              key={skill.id || index}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors group"
            >
              <div>
                <span className="font-semibold text-sm text-foreground block">
                  {skill.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {skill.level}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-muted-foreground hover:text-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleOpenEdit(index)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil size={14} /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(index)}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
