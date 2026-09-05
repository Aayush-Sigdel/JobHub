"use client";

import { useState } from "react";
import { Camera, Eye, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ImagePopoverProps {
  profileImage: string;
  profileName: string;
  onImageUpdate: (url: string) => void;
}

export function ImagePopover({
  profileImage,
  profileName,
  onImageUpdate,
}: ImagePopoverProps) {
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(profileImage);

  const handleImageUpdate = () => {
    const normalizedUrl = imageUrl.trim();
    if (!normalizedUrl) return;
    onImageUpdate(normalizedUrl);
    setIsImageMenuOpen(false);
  };

  const handlePreviewImage = () => {
    if (profileImage) {
      window.open(profileImage, "_blank");
    }
    setIsImageMenuOpen(false);
  };

  const renderAvatar =
    profileImage ||
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(profileName || "User")}&backgroundColor=e2e8f0`;

  return (
    <div className="relative group">
      <Avatar className="size-24 border border-border">
        <AvatarImage src={renderAvatar} alt={profileName || "Profile"} />
        <AvatarFallback>{(profileName || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <Popover open={isImageMenuOpen} onOpenChange={setIsImageMenuOpen}>
        <PopoverTrigger asChild>
          <button className="absolute bottom-0 right-0 bg-card p-1.5 rounded-full border border-border shadow-sm hover:bg-muted transition-colors">
            <Camera className="w-4 h-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={8}
          className="w-80 p-4 bg-card border border-border shadow-lg rounded-xl flex flex-col gap-3"
        >
          <button
            onClick={handlePreviewImage}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors w-full text-left"
          >
            <Eye className="w-4 h-4 text-muted-foreground" /> Preview
          </button>
          <div className="space-y-2 border-t border-border pt-3">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="profile-image-url">
              Public image URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="profile-image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="pl-9"
                />
              </div>
              <Button type="button" onClick={handleImageUpdate} disabled={!imageUrl.trim()}>
                Save
              </Button>
            </div>
            {/* Device upload is hidden until a media-upload endpoint is available. */}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
