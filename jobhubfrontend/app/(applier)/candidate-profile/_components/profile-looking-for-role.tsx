"use client";

import { useState } from "react";
import { Plus, X, Pencil, Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";

interface LookingForRole {
  id: string;
  name: string;
  roleLevel: string;
  workType: string;
}

export function ProfileLookingForRole() {
  const [roles, setRoles] = useState<LookingForRole[]>([
    {
      id: "1",
      name: "Full Stack Engineer",
      roleLevel: "Senior-level",
      workType: "Remote",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("Mid-level");
  const [newWorkType, setNewWorkType] = useState("Remote");

  const addRole = () => {
    if (newName.trim()) {
      setRoles([
        ...roles,
        {
          id: Math.random().toString(),
          name: newName,
          roleLevel: newLevel,
          workType: newWorkType,
        },
      ]);
      setNewName("");
      setIsAdding(false);
    }
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-foreground">
            Preferred Roles
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            We match you with jobs based on these preferences.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex bg-muted items-center gap-1.5 px-3 py-1.5 border border-border text-foreground/80 hover:bg-muted rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 " /> Add
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between group p-4 border border-border/50 dark:border-border bg-muted rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-[15px]">
                  {role.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-muted-foreground">
                  <span className="bg-muted-foreground/20 px-2 py-0.5 rounded-md text-foreground/80">
                    {role.roleLevel}
                  </span>
                  <span className="bg-primary/10 text-muted-foreground border border-border px-2 py-0.5 rounded-md">
                    {role.workType}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeRole(role.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {roles.length === 0 && !isAdding && (
          <p className="text-muted-foreground text-sm italic py-4">
            No preferred roles added. Add some to get better job matches!
          </p>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border border-border rounded-xl p-5 bg-muted shadow-sm flex flex-col gap-4 overflow-hidden"
          >
            <div>
              <label className="text-xs font-bold text-foreground/80 mb-1.5 block">
                Role Title
              </label>
              <Input
                placeholder="e.g. Frontend Developer"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-card border-border py-5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground/80 mb-1.5 block">
                  Seniority
                </label>
                <select
                  className="w-full h-10 bg-card border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring  "
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                >
                  <option value="Internship">Internship</option>
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior-level">Senior-level</option>
                  <option value="Director">Director</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/80 mb-1.5 block">
                  Work Type
                </label>
                <select
                  className="w-full h-10 bg-card border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring"
                  value={newWorkType}
                  onChange={(e) => setNewWorkType(e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border/50 dark:border-border">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRole}
                className="px-6 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Save Role
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
