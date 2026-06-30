"use client";

import { useState } from "react";
import { MessageCircle, X, Pencil, Info, Plus } from "lucide-react";
import { Language } from "@/types/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LanguagesPopoverProps {
  profileLanguages: Language[];
  setProfileLanguages: (langs: Language[]) => void;
}

export function LanguagesPopover({
  profileLanguages,
  setProfileLanguages,
}: LanguagesPopoverProps) {
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const newLangs = [...profileLanguages];
    newLangs[index] = { ...newLangs[index], [field]: value };
    setProfileLanguages(newLangs);
  };

  const addLanguage = () => {
    setProfileLanguages([...profileLanguages, { name: "", proficiency: "Basic" }]);
  };

  const removeLanguage = (index: number) => {
    setProfileLanguages(profileLanguages.filter((_, i) => i !== index));
  };

  return (
    <Popover open={isLanguagesOpen} onOpenChange={setIsLanguagesOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline group">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          {profileLanguages && profileLanguages.length > 0 ? (
            <span className="dark:text-foreground/80">
              Speaks {profileLanguages.map((lang) => lang.name).join(", ")}
            </span>
          ) : (
            <span className="text-muted-foreground">Add languages</span>
          )}
          {profileLanguages.length > 0 ? (
            <X className="w-3.5 h-3.5 ml-1 text-muted-foreground group-hover:text-foreground" />
          ) : (
            <Pencil className="w-3 h-3 ml-0.5 text-muted-foreground group-hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[360px] p-5 bg-card border border-border shadow-xl rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-start gap-2 bg-info/10 border border-info/20 rounded-lg p-3 text-sm text-foreground/80 leading-relaxed">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p>
            Add the languages you work in and your proficiency level to align
            expectations with potential clients.
          </p>
        </div>

        <div className="flex flex-col gap-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {profileLanguages.map((lang, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <select
                value={lang.name}
                onChange={(e) => updateLanguage(idx, "name", e.target.value)}
                className="w-full h-10 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="" disabled>Select language...</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>

              <select
                value={lang.proficiency || "Basic"}
                onChange={(e) => updateLanguage(idx, "proficiency", e.target.value)}
                className="w-full h-10 px-3 border border-input rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native/Bilingual">Native/Bilingual</option>
              </select>

              <button
                onClick={() => removeLanguage(idx)}
                className="text-[13px] font-semibold text-muted-foreground hover:text-foreground self-end mt-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addLanguage}
          className="mt-2 w-max px-4 py-2 text-[14px] font-semibold text-foreground/90 border border-input rounded-lg flex items-center gap-2 hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" /> Add languages
        </button>
      </PopoverContent>
    </Popover>
  );
}
