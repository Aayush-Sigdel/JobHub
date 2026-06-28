"use client";

import { useState } from "react";
import { Plus, X, MoreHorizontal, Briefcase, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileWorkExperience() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    employmentType: "",
    company: "",
    isCurrent: false,
    startDate: "",
    endDate: "",
    description: "",
    skills: "",
    industry: "",
  });

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "", employmentType: "", company: "", isCurrent: false,
      startDate: "", endDate: "", description: "", skills: "", industry: ""
    });
    setEditIndex(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setFormData(experiences[index]);
    setIsAddOpen(false);
    setEditIndex(index);
  };

  const handleSave = () => {
    if (!formData.title || !formData.company) return;
    
    if (editIndex !== null) {
      const newExps = [...experiences];
      newExps[editIndex] = formData;
      setExperiences(newExps);
      setEditIndex(null);
    } else {
      setExperiences([{ id: Math.random(), ...formData }, ...experiences]);
      setIsAddOpen(false);
    }
  };

  const handleDelete = (index: number) => {
    const newExps = [...experiences];
    newExps.splice(index, 1);
    setExperiences(newExps);
    if (editIndex === index) setEditIndex(null);
  };

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
            {isEditing ? "Edit experience" : "Add new"}
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
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="h-11 rounded-lg border-input"
          />
          
          <select
            value={formData.employmentType}
            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Employment type (Optional)</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>

          <Input
            placeholder="Company name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="h-11 rounded-lg border-input"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="current-work"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="w-4 h-4 rounded border-input text-foreground focus:ring-ring"
            />
            <label htmlFor="current-work" className="text-sm text-foreground/80">I currently work here</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="month"
              placeholder="Start date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="h-11 rounded-lg border-input"
            />
            <Input
              type="month"
              placeholder="End date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              disabled={formData.isCurrent}
              className="h-11 rounded-lg border-input disabled:bg-muted"
            />
          </div>

          <div>
            <textarea
              placeholder="Add your job history and achievements to give employers insight into your expertise."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[120px] p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">{formData.description.length}/2000 characters</span>
            </div>
          </div>

          <select
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Skills (Optional)</option>
            <option value="React">React</option>
            <option value="Node">Node</option>
          </select>

          <select
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full h-11 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="" disabled>Industry (Optional)</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => isEditing ? setEditIndex(null) : setIsAddOpen(false)}
            className="px-5 py-2 rounded-lg font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title || !formData.company}
            className="px-5 py-2 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-primary/50"
          >
            {isEditing ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Work experience</h2>
        {!isAddOpen && editIndex === null && (
          <button 
            onClick={handleOpenAdd}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAddOpen && renderForm(false)}
      </AnimatePresence>

      {experiences.length === 0 && !isAddOpen ? (
        <div className="text-muted-foreground text-sm">
          <p>Add your job history and achievements to give employers insight into your expertise.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div key={exp.id}>
              <AnimatePresence>
                {editIndex === idx ? (
                  renderForm(true)
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-border rounded-xl p-4 flex gap-4 hover:border-input transition-colors"
                  >
                    <div className="w-10 h-10 bg-muted border border-border rounded-full flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-foreground">{exp.company}</h3>
                          <p className="text-sm text-muted-foreground">{exp.title} {exp.employmentType ? `• ${exp.employmentType}` : ""}</p>
                          <p className="text-sm text-muted-foreground mt-1">{exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}</p>
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
                            <DropdownMenuItem onClick={() => handleDelete(idx)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>
                      {exp.description && (
                        <p className="text-sm text-foreground/90 mt-3 whitespace-pre-wrap">{exp.description}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
