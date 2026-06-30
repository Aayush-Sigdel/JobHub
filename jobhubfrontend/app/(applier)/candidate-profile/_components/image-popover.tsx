"use client";

import { useRef, useState } from "react";
import { Camera, Eye, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ImagePopoverProps {
  profileImage: string;
  profileUsername: string;
  onImageUpdate: (url: string) => void;
}

export function ImagePopover({
  profileImage,
  profileUsername,
  onImageUpdate,
}: ImagePopoverProps) {
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageUpdate(url);
    }
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
    `https://api.dicebear.com/9.x/notionists/svg?seed=${profileUsername}&backgroundColor=e2e8f0`;

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border border-border">
        <img
          src={renderAvatar}
          alt="Profile"
          className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
        />
      </div>

      <Popover open={isImageMenuOpen} onOpenChange={setIsImageMenuOpen}>
        <PopoverTrigger asChild>
          <button className="absolute bottom-0 right-0 bg-card p-1.5 rounded-full border border-border shadow-sm hover:bg-muted transition-colors">
            <Camera className="w-4 h-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={8}
          className="w-48 p-1.5 bg-card border border-border shadow-lg rounded-xl flex flex-col"
        >
          <button
            onClick={handlePreviewImage}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors w-full text-left"
          >
            <Eye className="w-4 h-4 text-muted-foreground" /> Preview
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors w-full text-left"
          >
            <Upload className="w-4 h-4 text-muted-foreground" /> Upload from device
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
