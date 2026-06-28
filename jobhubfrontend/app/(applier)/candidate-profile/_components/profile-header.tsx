"use client";

import { Share, Eye, Pencil, Settings } from "lucide-react";
import { User, Language, Location } from "@/types/user";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ImagePopover } from "./image-popover";
import { LocationPopover } from "./location-popover";
import { LanguagesPopover } from "./languages-popover";

interface ProfileHeaderProps {
  imageUrl?: string;
  name: string;
  username: string;
  title?: string;
  location?: Location;
  languages?: Language[];
  isVerified?: boolean;
}

export function ProfileHeader({
  imageUrl,
  name,
  username,
  title,
  location,
  languages,
  isVerified,
}: ProfileHeaderProps) {
  const [profileImage, setProfileImage] = useState(imageUrl || "");
  const [profileName, setProfileName] = useState(name);
  const [profileUsername, setProfileUsername] = useState(username);
  const [profileTitle, setProfileTitle] = useState(title || "");
  const [profileLocation, setProfileLocation] = useState<Location | null>(
    location || null,
  );
  const [profileLanguages, setProfileLanguages] = useState<Language[]>(
    languages || [],
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [tempName, setTempName] = useState(profileName);
  const [tempUsername, setTempUsername] = useState(profileUsername);
  const [tempTitle, setTempTitle] = useState(profileTitle);
  const [copied, setCopied] = useState(false);

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProfileName(tempName);
      setIsEditingName(false);
    } else if (e.key === "Escape") {
      setTempName(profileName);
      setIsEditingName(false);
    }
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProfileUsername(tempUsername);
      setIsEditingUsername(false);
    } else if (e.key === "Escape") {
      setTempUsername(profileUsername);
      setIsEditingUsername(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProfileTitle(tempTitle);
      setIsEditingTitle(false);
    } else if (e.key === "Escape") {
      setTempTitle(profileTitle);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      <div className="flex items-center gap-6">
        <ImagePopover
          profileImage={profileImage}
          profileUsername={profileUsername}
          onImageUpdate={setProfileImage}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex flex-wrap items-center gap-2 h-8">
            {isEditingName ? (
              <Input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => {
                  setProfileName(tempName);
                  setIsEditingName(false);
                }}
                onKeyDown={handleNameKeyDown}
                className="h-8 w-48 text-xl font-bold bg-card border-input focus-visible:ring-ring px-2"
              />
            ) : (
              <h1
                className="text-2xl font-bold tracking-tight text-foreground  flex items-center gap-2 group cursor-pointer w-max"
                onClick={() => {
                  setTempName(profileName);
                  setIsEditingName(true);
                }}
              >
                {profileName}
                {isVerified && (
                  <div
                    className="w-5 h-5 bg-primary/100 rounded-full flex items-center justify-center"
                    title="Verified Professional"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground transition-colors" />
              </h1>
            )}

            {isEditingUsername ? (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-medium">@</span>
                <Input
                  autoFocus
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  onBlur={() => {
                    setProfileUsername(tempUsername);
                    setIsEditingUsername(false);
                  }}
                  onKeyDown={handleUsernameKeyDown}
                  className="h-7 w-32 text-sm bg-card border-input focus-visible:ring-ring px-2"
                />
              </div>
            ) : (
              <span
                className="text-muted-foreground font-medium text-sm ml-2 flex items-center gap-1 group cursor-pointer"
                onClick={() => {
                  setTempUsername(profileUsername);
                  setIsEditingUsername(true);
                }}
              >
                @{profileUsername}
                <Pencil className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
              </span>
            )}
          </div>

          <div className="h-6 flex items-center">
            {isEditingTitle ? (
              <Input
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  setProfileTitle(tempTitle);
                  setIsEditingTitle(false);
                }}
                onKeyDown={handleTitleKeyDown}
                className="h-7 w-64 text-sm bg-card border-input focus-visible:ring-ring px-2"
                placeholder="Professional title"
              />
            ) : (
              <div
                className="flex items-center gap-2 text-sm text-foreground/80 font-medium cursor-pointer hover:underline group w-max"
                onClick={() => {
                  setTempTitle(profileTitle);
                  setIsEditingTitle(true);
                }}
              >
                {profileTitle ? (
                  <span className="dark:text-foreground/80">{profileTitle}</span>
                ) : (
                  <span className="text-muted-foreground">Add title</span>
                )}
                <Pencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
            <LocationPopover
              profileLocation={profileLocation}
              setProfileLocation={setProfileLocation}
            />

            <LanguagesPopover
              profileLanguages={profileLanguages}
              setProfileLanguages={setProfileLanguages}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
        <button
          onClick={() => {
            const url = `${window.location.origin}/preview/${profileUsername || "me"}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-border font-semibold rounded-lg bg-card text-foreground/90 hover:bg-muted transition-colors relative"
        >
          <Share className="w-4 h-4 mr-2" /> {copied ? "Copied!" : "Share"}
        </button>

        <Link
          href={`/preview/${profileUsername || "me"}`}
          className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-border font-semibold rounded-lg bg-card text-foreground/90 hover:bg-muted transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" /> Preview
        </Link>
      </div>
    </div>
  );
}
