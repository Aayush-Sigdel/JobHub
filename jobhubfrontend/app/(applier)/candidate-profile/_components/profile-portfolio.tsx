"use client";

import { useState, useRef } from "react";
import { ExternalLink, Image as ImageIcon, Plus, Pencil, Link as LinkIcon, Trash2, Camera, FolderKanban, X } from "lucide-react";
import { Project } from "@/types/user";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { ALL_SKILLS } from "@/lib/data";
import { motion, AnimatePresence } from "motion/react";

interface ProfilePortfolioProps {
  initialProjects?: Project[];
}

export function ProfilePortfolio({ initialProjects = [] }: ProfilePortfolioProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: "",
    description: "",
    link: "",
    imageUrl: [],
    technologies: [],
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  const handleOpenAdd = () => {
    setNewProject({ title: "", description: "", link: "", imageUrl: [], technologies: [] });
    setEditIndex(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setNewProject(projects[index]);
    setIsAddOpen(false);
    setEditIndex(index);
  };

  const handleSave = () => {
    if (!newProject.title || !newProject.description) return;
    
    if (editIndex !== null) {
      const newProjects = [...projects];
      newProjects[editIndex] = newProject as Project;
      setProjects(newProjects);
      setEditIndex(null);
    } else {
      setProjects([
        {
          id: Math.random().toString(36).substr(2, 9),
          ...newProject
        } as Project,
        ...projects,
      ]);
      setIsAddOpen(false);
    }
  };

  const handleDelete = (index: number) => {
    const newProjects = [...projects];
    newProjects.splice(index, 1);
    setProjects(newProjects);
    if (editIndex === index) setEditIndex(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewProject({ ...newProject, imageUrl: [url] });
    }
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
            {isEditing ? "Edit project" : "Add new project"}
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
            placeholder="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            className="h-11 rounded-lg border-input"
          />
          
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Describe your role and what you built..."
            className="w-full min-h-[120px] p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-ring text-sm"
          />

          <div>
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Skills & Technologies</label>
            <MultiSelect
              options={ALL_SKILLS}
              selected={newProject.technologies || []}
              onChange={(techs) => setNewProject({ ...newProject, technologies: techs })}
              placeholder="Select skills..."
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Project Link (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                value={newProject.link || ""}
                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                placeholder="https://..."
                className="pl-9 bg-card border-input h-11 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Cover Image</label>
            <div 
              className="border-2 border-dashed border-input rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
              onClick={() => isEditing ? editFileInputRef.current?.click() : fileInputRef.current?.click()}
            >
              {(newProject.imageUrl && newProject.imageUrl.length > 0) ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                  <img src={newProject.imageUrl[0]} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-primary-foreground text-sm font-semibold flex items-center gap-2"><Camera className="w-4 h-4" /> Change Image</p>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-semibold text-foreground/80">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 1200x630px</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={isEditing ? editFileInputRef : fileInputRef}
              onChange={handleImageUpload}
            />
          </div>
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
              disabled={!newProject.title || !newProject.description}
              className="px-5 py-2 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-primary/50"
            >
              {isEditing ? "Update" : "Add Project"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );


  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground ">Portfolio</h2>
          <p className="text-muted-foreground text-sm mt-1">Showcase your best projects and past work.</p>
        </div>
        
        {!isAddOpen && editIndex === null && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-semibold mb-6 text-foreground"
          >
            <Plus className="w-4 h-4" /> Add new
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAddOpen && renderForm(false)}
      </AnimatePresence>

      {projects.length === 0 && !isAddOpen ? (
        <div className="text-muted-foreground text-sm">
          <p>Add your past work, case studies, or personal projects to show employers what you're capable of building.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <div key={project.id}>
              <AnimatePresence>
                {editIndex === idx ? (
                  <div className="col-span-full mb-6">
                    {renderForm(true)}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-card flex flex-col h-full"
                  >
                    <div className="aspect-video bg-muted relative border-b border-border/50 dark:border-border overflow-hidden">
                      {project.imageUrl && project.imageUrl.length > 0 ? (
                        <img 
                          src={project.imageUrl[0]} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                      
                      {/* Overlay Edit Button */}
                      <button 
                        onClick={() => handleOpenEdit(idx)}
                        className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm text-foreground/80 hover:text-foreground rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-foreground text-lg mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">{project.description}</p>
                      
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                          {project.technologies.slice(0, 3).map(tech => (
                            <span key={tech} className="px-2 py-0.5 bg-muted text-foreground/80 text-[11px] font-semibold rounded-md border border-border">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[11px] font-semibold rounded-md border border-border">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 mt-2 w-max"
                        >
                          View Project <ExternalLink className="w-3.5 h-3.5" />
                        </a>
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
