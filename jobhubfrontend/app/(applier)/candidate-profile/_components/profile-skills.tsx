"use client";

import { useState } from "react";
import { Plus, X, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileSkills() {
  const [skills, setSkills] = useState<any[]>([
    { id: 1, name: "Godot", level: "Beginner" },
    { id: 2, name: "Game design", level: "Beginner" },
    { id: 3, name: "Game testing", level: "Beginner" },
    { id: 4, name: "3D game design", level: "Beginner" },
    { id: 5, name: "HTML", level: "Beginner" },
    { id: 6, name: "CSS", level: "Beginner" }
  ]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", level: "" });

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", level: "" });
    setEditIndex(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setFormData(skills[index]);
    setIsAddOpen(false);
    setEditIndex(index);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editIndex !== null) {
      const newSkills = [...skills];
      newSkills[editIndex] = { ...formData, level: formData.level || "Beginner" };
      setSkills(newSkills);
      setEditIndex(null);
    } else {
      setSkills([{ id: Math.random(), name: formData.name, level: formData.level || "Beginner" }, ...skills]);
      setIsAddOpen(false);
    }
  };

  const handleDelete = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
    if (editIndex === index) setEditIndex(null);
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
            {isEditing ? "Edit skill" : "Add new"}
          </div>
          <button 
            onClick={() => isEditing ? setEditIndex(null) : setIsAddOpen(false)} 
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditing && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex items-start gap-2 mb-4">
            <span className="text-info text-sm mt-0.5">ℹ️</span>
            <p className="text-sm text-foreground/80">Adding your specific skills helps to make sure the right employers reach you.</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            placeholder="Add skill or expertise (For example JavaScript)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 rounded-lg border-input"
          />
          
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Experience level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        <div className="flex justify-between mt-6">
          {isEditing ? (
            <button
              onClick={() => editIndex !== null && handleDelete(editIndex)}
              className="px-5 py-2 rounded-lg font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              Delete
            </button>
          ) : <div></div>}
          <div className="flex gap-3">
            <button
              onClick={() => isEditing ? setEditIndex(null) : setIsAddOpen(false)}
              className="px-5 py-2 rounded-lg font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="px-5 py-2 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-primary/50"
            >
              {isEditing ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Skills and expertise</h2>
      </div>

      {!isAddOpen && editIndex === null && (
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-semibold mb-6 text-foreground"
        >
          <Plus className="w-4 h-4" /> Add new
        </button>
      )}

      <AnimatePresence>
        {isAddOpen && renderForm(false)}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill, idx) => (
          editIndex === idx ? (
            <AnimatePresence key={`edit-${skill.id}`}>
              {renderForm(true)}
            </AnimatePresence>
          ) : (
            <motion.div 
              key={skill.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-border rounded-xl p-4 hover:border-input transition-colors flex flex-col gap-1 relative group"
            >
              <h3 className="font-semibold text-[15px] text-foreground pr-6 truncate">{skill.name}</h3>
              <p className="text-sm text-muted-foreground">{skill.level}</p>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute right-3 top-3 text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 bg-card">
                  <DropdownMenuItem onClick={() => handleOpenEdit(idx)} className="cursor-pointer text-foreground/80 focus:bg-muted focus:text-foreground">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(idx)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}
