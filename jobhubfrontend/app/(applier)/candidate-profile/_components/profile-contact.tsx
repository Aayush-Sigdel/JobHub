"use client";

import { useState } from "react";
import { Mail, Code, Briefcase, Globe, Link as LinkIcon, Plus, X, Pencil, Phone, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";

interface SocialLink {
  platform: string;
  url: string;
}

export function ProfileContact() {
  const [emails, setEmails] = useState<string[]>(["aayush@example.com"]);
  const [phones, setPhones] = useState<string[]>(["+1 (555) 123-4567"]);
  
  // Adding new contact details
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  
  const [isAddPhoneOpen, setIsAddPhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "LinkedIn", url: "https://linkedin.com/in/aayushsigdel" },
    { platform: "GitHub", url: "https://github.com/aayushsigdel" },
  ]);

  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState("LinkedIn");
  const [newUrl, setNewUrl] = useState("");

  const addEmail = () => {
    if (newEmail.trim() && !emails.includes(newEmail)) {
      setEmails([...emails, newEmail]);
      setNewEmail("");
      setIsAddEmailOpen(false);
    }
  };

  const removeEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
  };

  const addPhone = () => {
    if (newPhone.trim() && !phones.includes(newPhone)) {
      setPhones([...phones, newPhone]);
      setNewPhone("");
      setIsAddPhoneOpen(false);
    }
  };

  const removePhone = (index: number) => {
    const newPhones = [...phones];
    newPhones.splice(index, 1);
    setPhones(newPhones);
  };

  const addSocialLink = () => {
    if (newUrl.trim()) {
      setSocialLinks([...socialLinks, { platform: newPlatform, url: newUrl }]);
      setNewUrl("");
      setIsAddLinkOpen(false);
    }
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
  };

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <Code className="w-5 h-5 text-foreground/80" />;
      case "portfolio":
        return <Briefcase className="w-5 h-5 text-success" />;
      case "blog":
        return <BookOpen className="w-5 h-5 text-success" />;
      default:
        return <LinkIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Email Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold">Email Addresses</h2>
          {!isAddEmailOpen && (
            <button 
              onClick={() => setIsAddEmailOpen(true)}
              className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {emails.map((em, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 truncate">{em}</span>
              {emails.length > 1 && (
                <button 
                  onClick={() => removeEmail(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isAddEmailOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border border-border rounded-xl p-4 bg-muted/50 flex flex-col gap-3 overflow-hidden"
            >
              <Input
                placeholder="new@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-card border-input"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsAddEmailOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addEmail}
                  className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-muted w-full" />

      {/* Phone Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold">Phone Numbers</h2>
          {!isAddPhoneOpen && (
            <button 
              onClick={() => setIsAddPhoneOpen(true)}
              className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {phones.map((phone, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 truncate">{phone}</span>
              <button 
                onClick={() => removePhone(idx)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isAddPhoneOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border border-border rounded-xl p-4 bg-muted/50 flex flex-col gap-3 overflow-hidden"
            >
              <Input
                placeholder="+1 (555) ..."
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-card border-input"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsAddPhoneOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addPhone}
                  className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-muted w-full" />

      {/* Social Links Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold">Social Links</h2>
          {!isAddLinkOpen && (
            <button 
              onClick={() => setIsAddLinkOpen(true)}
              className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {socialLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                {getIcon(link.platform)}
              </div>
              <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary/80 truncate flex-1">
                {link.platform}
              </a>
              <button 
                onClick={() => removeSocialLink(idx)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isAddLinkOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border border-border rounded-xl p-4 bg-muted/50 flex flex-col gap-3 overflow-hidden"
            >
              <select 
                className="w-full h-10 bg-card border border-input rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="GitHub">GitHub</option>
                <option value="ORCID">ORCID</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
              <Input
                placeholder="https://"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-card border-input"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsAddLinkOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addSocialLink}
                  className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
