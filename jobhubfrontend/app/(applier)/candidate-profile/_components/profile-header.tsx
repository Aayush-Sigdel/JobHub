"use client";

import { Share, Eye, Pencil } from "lucide-react";
import { Location } from "@/types/user";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ImagePopover } from "./image-popover";
import { LocationPopover } from "./location-popover";
import { updateProfileAction } from "@/lib/actions/user";

interface ProfileHeaderProps {
  userId?: string;
  imageUrl?: string;
  name: string;
  title?: string;
  location?: Location;
  isVerified?: boolean;
}

export function ProfileHeader({
  userId,
  imageUrl,
  name,
  title,
  location,
  isVerified,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(imageUrl || "");
  const [profileName, setProfileName] = useState(name);
  const [profileTitle, setProfileTitle] = useState(title || "");
  const [profileLocation, setProfileLocation] = useState<Location | null>(
    location || null,
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [tempTitle, setTempTitle] = useState(profileTitle);
  const [copied, setCopied] = useState(false);

  const saveHeaderChanges = async (updates: {
    name?: string;
    title?: string;
    location?: Location | null;
    imageUrl?: string;
  }) => {
    try {
      const locString = updates.location
        ? `${updates.location.city}${updates.location.country ? ", " + updates.location.country : ""}`
        : profileLocation
          ? `${profileLocation.city}${profileLocation.country ? ", " + profileLocation.country : ""}`
          : undefined;

      await updateProfileAction({
        name: updates.name !== undefined ? updates.name : profileName,
        title: updates.title !== undefined ? updates.title : profileTitle,
        imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : profileImage,
        location: locString,
      });

      router.refresh();
    } catch (err) {
      console.error("Failed to save profile header changes:", err);
    }
  };

  const handleNameKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProfileName(tempName);
      setIsEditingName(false);
      await saveHeaderChanges({ name: tempName });
    } else if (e.key === "Escape") {
      setTempName(profileName);
      setIsEditingName(false);
    }
  };

  const handleTitleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProfileTitle(tempTitle);
      setIsEditingTitle(false);
      await saveHeaderChanges({ title: tempTitle });
    } else if (e.key === "Escape") {
      setTempTitle(profileTitle);
      setIsEditingTitle(false);
    }
  };

  const handleLocationChange = async (newLoc: Location) => {
    setProfileLocation(newLoc);
    await saveHeaderChanges({ location: newLoc });
  };

  const handleImageUpdate = async (newImgUrl: string) => {
    setProfileImage(newImgUrl);
    await saveHeaderChanges({ imageUrl: newImgUrl });
  };

  const previewId = userId || "me";

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      <div className="flex items-center gap-6">
        <ImagePopover
          profileImage={profileImage}
          profileName={profileName}
          onImageUpdate={handleImageUpdate}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex flex-wrap items-center gap-2 h-8">
            {isEditingName ? (
              <Input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={async () => {
                  setProfileName(tempName);
                  setIsEditingName(false);
                  await saveHeaderChanges({ name: tempName });
                }}
                onKeyDown={handleNameKeyDown}
                className="h-8 w-48 text-xl font-bold bg-card border-input focus-visible:ring-ring px-2"
              />
            ) : (
              <h1
                className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 group cursor-pointer w-max"
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
                      className="w-3.5 h-3.5 text-black"
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
                <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </h1>
            )}
          </div>

          <div className="h-6 flex items-center">
            {isEditingTitle ? (
              <Input
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={async () => {
                  setProfileTitle(tempTitle);
                  setIsEditingTitle(false);
                  await saveHeaderChanges({ title: tempTitle });
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
              setProfileLocation={handleLocationChange}
            />
            {/* Languages are hidden until profile language endpoints are available. */}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
        <button
          onClick={() => {
            const url = `${window.location.origin}/preview/${previewId}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-border font-semibold rounded-lg bg-card text-foreground hover:bg-muted transition-colors relative cursor-pointer"
        >
          <Share className="w-4 h-4 mr-2" /> {copied ? "Copied Link!" : "Share"}
        </button>

        <Link
          href={`/preview/${previewId}`}
          className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-border font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4 mr-2" /> Public Preview
        </Link>
      </div>
    </div>
  );
}
