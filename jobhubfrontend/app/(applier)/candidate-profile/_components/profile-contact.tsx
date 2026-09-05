"use client";

import React, { useState } from "react";
import {
  Mail,
  Briefcase,
  Globe,
  Link as LinkIcon,
  Plus,
  X,
  Phone,
  Loader2,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import {
  addContactNumberAction,
  deleteContactNumberAction,
  addSocialLinkAction,
  updateSocialLinkAction,
  deleteSocialLinkAction,
} from "@/lib/actions/user";

interface SocialLinkItem {
  id?: string;
  platform: string;
  url: string;
}

interface ProfileContactProps {
  initialEmails?: string[];
  initialPhones?: string[];
  initialSocialLinks?: SocialLinkItem[];
}

const SOCIAL_PLATFORMS = [
  { value: "LINKEDIN", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { value: "GITHUB", label: "GitHub", placeholder: "https://github.com/username" },
  { value: "ORCID", label: "ORCID", placeholder: "https://orcid.org/0000-0000-0000-0000" },
  { value: "PORTFOLIO", label: "Portfolio", placeholder: "https://myportfolio.com" },
  { value: "WEBSITE", label: "Website", placeholder: "https://mywebsite.com" },
  { value: "STACKOVERFLOW", label: "Stack Overflow", placeholder: "https://stackoverflow.com/users/..." },
  { value: "DEV_TO", label: "Dev.to", placeholder: "https://dev.to/username" },
  { value: "OTHER", label: "Other", placeholder: "https://..." },
] as const;

function PlatformIcon({ platform, className = "w-4.5 h-4.5" }: { platform: string; className?: string }) {
  switch (platform.toUpperCase()) {
    case "LINKEDIN":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#0A66C2" aria-label="LinkedIn">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      );
    case "GITHUB":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="GitHub">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case "ORCID":
      return (
        <svg viewBox="0 0 256 256" className={className} aria-label="ORCID">
          <path fill="#A6CE39" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" />
          <path fill="#FFFFFF" d="M86.3 186.2H70.9V79.1h15.4v107.1zM78.6 66.8c-5.7 0-10.3-4.6-10.3-10.3s4.6-10.3 10.3-10.3 10.3 4.6 10.3 10.3-4.6 10.3-10.3 10.3zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 43.6-25.2 43.6-39.7 0-22.1-14.7-39.7-43.8-39.7h-24.3v79.4z" />
        </svg>
      );
    case "STACKOVERFLOW":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#F58025" aria-label="Stack Overflow">
          <path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.187-.453 2.068zm1.359-5.056l9.666 4.623.957-1.916-9.667-4.627-.956 1.92zm3.35-4.87l7.8 7.33 1.455-1.575-7.79-7.33-1.465 1.575zm6.56-4.953l-1.81 1.15 5.733 9.068 1.809-1.15-5.732-9.068z" />
        </svg>
      );
    case "DEV_TO":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Dev.to">
          <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H5.34v4.36h1.24c.4 0 .68-.08.85-.24.17-.16.25-.41.25-.76v-2.37c0-.35-.08-.6-.26-.76zM0 4.8v14.4C0 20.19.81 21 1.8 21h20.4c.99 0 1.8-.81 1.8-1.8V4.8c0-.99-.81-1.8-1.8-1.8H1.8C.81 3 0 3.81 0 4.8zm3.69 10.97V8.23h2.89c.84 0 1.49.23 1.95.68.46.45.69 1.1.69 1.95v2.28c0 .85-.23 1.5-.69 1.95-.46.45-1.11.68-1.95.68H3.69v-.03zm7.81 0V8.23h4.94v1.65h-3.29v1.62h3.13v1.65h-3.13v1.62h3.29v1.65h-4.94v-.02zm6.39 0l1.83-7.54h1.75l1.83 7.54h-1.72l-.35-1.63h-1.27l-.35 1.63h-1.72zm2.34-3.12h.74l-.37-1.9-.37 1.9z" />
        </svg>
      );
    case "PORTFOLIO":
      return <Briefcase className={className} />;
    case "WEBSITE":
      return <Globe className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
}

function formatPlatformLabel(platform: string): string {
  const match = SOCIAL_PLATFORMS.find((p) => p.value.toUpperCase() === platform.toUpperCase());
  return match ? match.label : platform;
}

export function ProfileContact({
  initialEmails,
  initialPhones,
  initialSocialLinks,
}: ProfileContactProps) {
  const router = useRouter();
  const [emails] = useState<string[]>(initialEmails || []);
  const [phones, setPhones] = useState<string[]>(initialPhones || []);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(
    initialSocialLinks || [],
  );

  const [isAddPhoneOpen, setIsAddPhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [newPlatform, setNewPlatform] = useState("LINKEDIN");
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const usedPlatforms = new Set(
    socialLinks.map((link, index) =>
      index === editingLinkIndex ? "" : link.platform.toUpperCase(),
    ),
  );
  const firstAvailablePlatform = SOCIAL_PLATFORMS.find(
    ({ value }) => !usedPlatforms.has(value),
  )?.value;

  const addPhone = async () => {
    const trimmed = newPhone.trim();
    if (!trimmed || phones.includes(trimmed)) return;

    try {
      setIsLoading(true);
      await addContactNumberAction(trimmed);
      setPhones([...phones, trimmed]);
      setNewPhone("");
      setIsAddPhoneOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to add contact number:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removePhone = async (phoneToDelete: string) => {
    try {
      await deleteContactNumberAction(phoneToDelete);
      setPhones(phones.filter((p) => p !== phoneToDelete));
      router.refresh();
    } catch (err) {
      console.error("Failed to remove contact number:", err);
    }
  };

  const saveSocialLink = async () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) return;

    const platformKey = newPlatform.toUpperCase();
    const duplicatePlatform = socialLinks.some(
      (link, index) =>
        index !== editingLinkIndex && link.platform.toUpperCase() === platformKey,
    );
    if (duplicatePlatform) {
      toast.error("Only one link can be added for each social platform.");
      return;
    }

    try {
      setIsLoading(true);
      if (editingLinkIndex !== null && socialLinks[editingLinkIndex]?.id) {
        const currentLink = socialLinks[editingLinkIndex];
        const updatedLink = await updateSocialLinkAction(currentLink.id!, {
          platform: platformKey,
          url: trimmedUrl,
        });
        const updatedLinks = [...socialLinks];
        updatedLinks[editingLinkIndex] = updatedLink?.id
          ? updatedLink
          : { ...currentLink, platform: platformKey, url: trimmedUrl };
        setSocialLinks(updatedLinks);
      } else {
        const created = await addSocialLinkAction({
          platform: platformKey,
          url: trimmedUrl,
        });
        const finalLink = created?.id
          ? created
          : {
              id: Math.random().toString(),
              platform: platformKey,
              url: trimmedUrl,
            };
        setSocialLinks([...socialLinks, finalLink]);
      }
      setNewUrl("");
      setIsAddLinkOpen(false);
      setEditingLinkIndex(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to add social link:", err);
      toast.error(err instanceof Error ? err.message : "Unable to save this social link.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddSocialLink = () => {
    if (!firstAvailablePlatform) return;
    setEditingLinkIndex(null);
    setNewPlatform(firstAvailablePlatform);
    setNewUrl("");
    setIsAddLinkOpen(true);
  };

  const openEditSocialLink = (link: SocialLinkItem, index: number) => {
    setEditingLinkIndex(index);
    setNewPlatform(link.platform.toUpperCase());
    setNewUrl(link.url);
    setIsAddLinkOpen(true);
  };

  const closeSocialLinkForm = () => {
    setEditingLinkIndex(null);
    setNewUrl("");
    setIsAddLinkOpen(false);
  };

  const removeSocialLink = async (linkItem: SocialLinkItem, index: number) => {
    try {
      if (linkItem.id) {
        await deleteSocialLinkAction(linkItem.id);
      }
      const updated = [...socialLinks];
      updated.splice(index, 1);
      setSocialLinks(updated);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete social link:", err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-6">
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
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border">
                <Mail className="w-4.5 h-4.5 text-muted-foreground" />
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
              type="button"
              onClick={() => setIsAddPhoneOpen(true)}
              className="p-1 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Add phone number"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {phones.map((phone, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-[15px] font-medium text-foreground/90 group"
            >
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border">
                <Phone className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <span className="flex-1 truncate">{phone}</span>
              <button
                type="button"
                onClick={() => removePhone(phone)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-all cursor-pointer"
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="mt-4 border border-border rounded-xl p-4 bg-muted/40 flex flex-col gap-3 overflow-hidden"
            >
              <Input
                placeholder="+977 98XXXXXXXX"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-card border-border h-10 rounded-xl text-sm focus-visible:ring-primary/40"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsAddPhoneOpen(false)}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={addPhone}
                  className="px-4 py-1.5 text-xs sm:text-sm font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
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
          {!isAddLinkOpen && firstAvailablePlatform && (
            <button
              type="button"
              onClick={openAddSocialLink}
              className="p-1 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Add social link"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Existing Social Links List with Brand Logos */}
        <div className="flex flex-col gap-2.5">
          {socialLinks.map((link, idx) => (
            <div
              key={link.id || idx}
              className="flex items-center gap-3 text-sm font-medium text-foreground group p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center shrink-0 border border-border/80 shadow-2xs">
                <PlatformIcon platform={link.platform} className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block leading-none">
                  {formatPlatformLabel(link.platform)}
                </span>
                <a
                  href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-xs sm:text-sm font-semibold text-foreground/90 truncate block mt-0.5"
                >
                  {link.url.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
              {link.id && (
                <button
                  type="button"
                  onClick={() => openEditSocialLink(link, idx)}
                  className="p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100 rounded-lg cursor-pointer"
                  title="Edit link"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeSocialLink(link, idx)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-all cursor-pointer"
                title="Remove link"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {socialLinks.length === 0 && !isAddLinkOpen && (
            <p className="text-xs text-muted-foreground">No social links added yet.</p>
          )}
        </div>

        {/* Expanding Add / Edit Social Link Box */}
        <AnimatePresence>
          {isAddLinkOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="mt-4 border border-border rounded-xl p-4 bg-muted/40 flex flex-col gap-3.5 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {editingLinkIndex !== null ? "Edit Social Link" : "Select Platform"}
                </span>
                <button
                  type="button"
                  onClick={closeSocialLinkForm}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Platform Chips with Actual Brand Logos - unhighlight already added with no extra text */}
              <div className="flex flex-wrap gap-1.5">
                {SOCIAL_PLATFORMS.map(({ value, label }) => {
                  const isUsed = usedPlatforms.has(value);
                  const isSelected = newPlatform === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isUsed}
                      onClick={() => setNewPlatform(value)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-black border-primary shadow-xs font-bold"
                          : isUsed
                          ? "opacity-30 cursor-not-allowed bg-muted/20 border-border/40 text-muted-foreground"
                          : "bg-background text-foreground border-border/80 hover:bg-muted"
                      }`}
                    >
                      <span className="shrink-0">
                        <PlatformIcon platform={value} className="w-3.5 h-3.5" />
                      </span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* URL Input with Contextual Icon and Platform Placeholder */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <PlatformIcon platform={newPlatform} className="w-4 h-4" />
                </div>
                <Input
                  placeholder={
                    SOCIAL_PLATFORMS.find((p) => p.value === newPlatform)?.placeholder || "https://"
                  }
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="bg-card border-border h-10 pl-9 rounded-xl text-sm focus-visible:ring-primary/40"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1 border-t border-border/60">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={closeSocialLinkForm}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={saveSocialLink}
                  className="px-4 py-1.5 text-xs sm:text-sm font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>{editingLinkIndex !== null ? "Update Link" : "Save Link"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
