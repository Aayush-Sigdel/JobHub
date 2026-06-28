"use client";

import { useState } from "react";
import { Plus, X, MoreHorizontal, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileEducation() {
  const [educationList, setEducationList] = useState<any[]>([
    { id: 1, school: "Pokhara university", degree: "B.A. Degree.", fieldOfStudy: "computer science", country: "Nepal", year: "2027" }
  ]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ country: "", school: "", degree: "", fieldOfStudy: "", year: "" });

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setFormData({ country: "", school: "", degree: "", fieldOfStudy: "", year: "" });
    setEditIndex(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setFormData(educationList[index]);
    setIsAddOpen(false);
    setEditIndex(index);
  };

  const handleSave = () => {
    if (!formData.school) return;
    
    if (editIndex !== null) {
      const newList = [...educationList];
      newList[editIndex] = formData;
      setEducationList(newList);
      setEditIndex(null);
    } else {
      setEducationList([{ id: Math.random(), ...formData }, ...educationList]);
      setIsAddOpen(false);
    }
  };

  const handleDelete = (index: number) => {
    const newList = [...educationList];
    newList.splice(index, 1);
    setEducationList(newList);
    if (editIndex === index) setEditIndex(null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear + 5 - i).toString());

  const renderForm = (isEditing: boolean) => (
    <motion.div
      variants={accordionVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mb-6"
    >
      <div className="border-2 border-border rounded-xl p-5 bg-card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
            {isEditing ? "Edit education" : "Add new"}
          </div>
          <button 
            onClick={() => isEditing ? setEditIndex(null) : setIsAddOpen(false)} 
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Country</option>
            <option value="Nepal">Nepal</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="India">India</option>
          </select>

          <Input
            placeholder="School"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            className="h-11 rounded-lg border-input"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>Degree</option>
              <option value="B.A. Degree.">B.A. Degree.</option>
              <option value="B.S. Degree.">B.S. Degree.</option>
              <option value="Master's">Master's</option>
            </select>
            
            <Input
              placeholder="Field of study"
              value={formData.fieldOfStudy}
              onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
              className="h-11 rounded-lg border-input"
            />
          </div>
          
          <select
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Year of graduation</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
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
              disabled={!formData.school}
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
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Education</h2>
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

      <div className="space-y-4">
        {educationList.map((edu, idx) => (
          <div key={edu.id}>
            <AnimatePresence>
              {editIndex === idx ? (
                renderForm(true)
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-border rounded-xl p-4 flex items-start gap-4 hover:border-input transition-colors"
                >
                  <GraduationCap className="w-6 h-6 text-foreground/80 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-foreground text-[16px] mb-0.5">{edu.school}</h3>
                        <p className="text-muted-foreground text-[15px]">{edu.degree} {edu.fieldOfStudy}</p>
                        <p className="text-muted-foreground text-[15px] mt-0.5">{edu.country}, Graduated {edu.year}</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-card">
                          <DropdownMenuItem onClick={() => handleOpenEdit(idx)} className="cursor-pointer text-foreground/80 focus:bg-muted focus:text-foreground">
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(idx)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive/80">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
