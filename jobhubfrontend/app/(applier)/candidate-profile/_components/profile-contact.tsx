"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Code,
  Briefcase,
  Globe,
  Link as LinkIcon,
  Plus,
  X,
  Phone,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api";

interface SocialLinkItem {
  id?: string;
  platform: string;
  url: string;
}

interface ProfileContactProps {
  initialEmails?: string[];
  initialPhones?: string[];
  initialSocialLinks?: SocialLinkItem[];
  onContactUpdated?: () => void;
}

export function ProfileContact({
  initialEmails,
  initialPhones,
  initialSocialLinks,
  onContactUpdated,
}: ProfileContactProps) {
  const [emails, setEmails] = useState<string[]>(initialEmails || []);
  const [phones, setPhones] = useState<string[]>(initialPhones || []);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(
    initialSocialLinks || [],
  );

  const [isAddPhoneOpen, setIsAddPhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState("LinkedIn");
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialEmails) setEmails(initialEmails);
  }, [initialEmails]);

  useEffect(() => {
    if (initialPhones) setPhones(initialPhones);
  }, [initialPhones]);

  useEffect(() => {
    if (initialSocialLinks) setSocialLinks(initialSocialLinks);
  }, [initialSocialLinks]);

  const addPhone = async () => {
    const trimmed = newPhone.trim();
    if (!trimmed || phones.includes(trimmed)) return;

    try {
      setIsLoading(true);
      await api.post("/user/profile/contact-number", { contactNumber: trimmed });
      setPhones([...phones, trimmed]);
      setNewPhone("");
      setIsAddPhoneOpen(false);
      if (onContactUpdated) onContactUpdated();
    } catch (err) {
      console.error("Failed to add contact number:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removePhone = async (phoneToDelete: string) => {
    try {
      await api.delete("/user/profile/contact-number", {
        data: { contactNumber: phoneToDelete },
      });
      setPhones(phones.filter((p) => p !== phoneToDelete));
      if (onContactUpdated) onContactUpdated();
    } catch (err) {
      console.error("Failed to remove contact number:", err);
    }
  };

  const addSocialLink = async () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) return;

    try {
      setIsLoading(true);
      const platformKey = newPlatform.toUpperCase();
      const res = await api.post("/user/profile/social-links", {
        platform: platformKey,
        url: trimmedUrl,
      });
      const created = res.data || {
        id: Math.random().toString(),
        platform: newPlatform,
        url: trimmedUrl,
      };
      setSocialLinks([...socialLinks, created]);
      setNewUrl("");
      setIsAddLinkOpen(false);
      if (onContactUpdated) onContactUpdated();
    } catch (err) {
      console.error("Failed to add social link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSocialLink = async (linkItem: SocialLinkItem, index: number) => {
    try {
      if (linkItem.id) {
        await api.delete(`/user/profile/social-links/${linkItem.id}`);
      }
      const updated = [...socialLinks];
      updated.splice(index, 1);
      setSocialLinks(updated);
      if (onContactUpdated) onContactUpdated();
    } catch (err) {
      console.error("Failed to delete social link:", err);
    }
  };

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <Code className="w-5 h-5 text-foreground/80" />;
      case "portfolio":
      case "linkedin":
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "website":
        return <Globe className="w-5 h-5 text-emerald-500" />;
      case "orcid":
      case "blog":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      default:
        return <LinkIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Email Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-foreground">Email Addresses</h2>
        </div>

        <div className="flex flex-col gap-3">
          {emails.map((em, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group"
            >
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 truncate">{em}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      {/* Phone Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-foreground">Phone Numbers</h2>
          {!isAddPhoneOpen && (
            <button
              onClick={() => setIsAddPhoneOpen(true)}
              className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {phones.map((phone, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group"
            >
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 truncate">{phone}</span>
              <button
                onClick={() => removePhone(phone)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all cursor-pointer"
                title="Remove number"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {phones.length === 0 && !isAddPhoneOpen && (
            <p className="text-xs text-muted-foreground">No phone numbers added.</p>
          )}
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
                placeholder="+977 98XXXXXXXX"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-card border-input"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsAddPhoneOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={addPhone}
                  className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-border w-full" />

      {/* Social Links Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-foreground">Social Links</h2>
          {!isAddLinkOpen && (
            <button
              onClick={() => setIsAddLinkOpen(true)}
              className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {socialLinks.map((link, idx) => (
            <div
              key={link.id || idx}
              className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group"
            >
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                {getIcon(link.platform)}
              </div>
              <a
                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline hover:text-primary truncate flex-1"
              >
                {link.platform}
              </a>
              <button
                onClick={() => removeSocialLink(link, idx)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all cursor-pointer"
                title="Remove link"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {socialLinks.length === 0 && !isAddLinkOpen && (
            <p className="text-xs text-muted-foreground">No social links added.</p>
          )}
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
                className="w-full h-10 bg-card border border-input rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="GitHub">GitHub</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Website">Website</option>
                <option value="ORCID">ORCID</option>
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
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsAddLinkOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={addSocialLink}
                  className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
