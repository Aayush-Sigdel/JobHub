"use client";

import { useState } from "react";
import { Plus, X, MoreHorizontal, Award, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileCertifications() {
  const [certifications, setCertifications] = useState<any[]>([
    { id: 1, name: "das dsa", provider: "Adobe", year: "2026" }
  ]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", provider: "", year: "" });

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", provider: "", year: "" });
    setEditIndex(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setFormData(certifications[index]);
    setIsAddOpen(false);
    setEditIndex(index);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editIndex !== null) {
      const newCerts = [...certifications];
      newCerts[editIndex] = formData;
      setCertifications(newCerts);
      setEditIndex(null);
    } else {
      setCertifications([{ id: Math.random(), ...formData }, ...certifications]);
      setIsAddOpen(false);
    }
  };

  const handleDelete = (index: number) => {
    const newCerts = [...certifications];
    newCerts.splice(index, 1);
    setCertifications(newCerts);
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
            {isEditing ? "Edit certification" : "Add new"}
          </div>
          <button 
            onClick={() => isEditing ? setEditIndex(null) : setIsAddOpen(false)} 
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Certificate or award"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 rounded-lg border-input"
          />
          
          <Input
            placeholder="Received from (For example Adobe)"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            className="h-11 rounded-lg border-input"
          />
          
          <select
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Year received</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between mt-6">
          {isEditing ? (
            <button 
              onClick={() => editIndex !== null && handleDelete(editIndex)}
              className="px-5 py-2 rounded-lg font-semibold text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors"
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
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Certifications</h2>
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
        {certifications.map((cert, idx) => (
          <div key={cert.id}>
            <AnimatePresence>
              {editIndex === idx ? (
                renderForm(true)
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-border rounded-xl p-4 flex items-start gap-4 hover:border-input transition-colors"
                >
                  <Award className="w-6 h-6 text-foreground/80 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-foreground text-[15px]">{cert.name}</h3>
                        {cert.provider && <p className="text-muted-foreground text-[15px] mt-0.5">{cert.provider}</p>}
                        <p className="text-muted-foreground text-sm mt-0.5">{cert.year}</p>
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
