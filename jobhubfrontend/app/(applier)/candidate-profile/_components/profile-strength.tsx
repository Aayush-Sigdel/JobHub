"use client";

import { useState } from "react";
import { FileText, Video, Award, Shield, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming Shadcn UI switch exists, or just use native checkbox

export function ProfileStrength() {
  const [hideEmail, setHideEmail] = useState(false);
  const [hideContact, setHideContact] = useState(false);
  const [hideLocation, setHideLocation] = useState(false);
  const [genericImage, setGenericImage] = useState(false);
  const [hideVideo, setHideVideo] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-[17px] font-bold">Profile Strength</h2>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black">8</span>
            <span className="text-muted-foreground font-semibold text-sm">/12</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Your profile strength is calculated dynamically based on how well your skills and <strong className="text-foreground/90">Preferred Roles</strong> match active jobs in our database.
        </p>
        
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden mb-6">
          <div className="bg-brand w-[66%] h-full rounded-full transition-all duration-500"></div>
        </div>
        
        <h3 className="text-sm font-bold text-foreground mb-3 mt-8">Quick Links</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-[14px] font-semibold text-foreground/90 block">My Applications</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors">
            <Check className="w-5 h-5 text-muted-foreground" />
            <span className="text-[14px] font-semibold text-foreground/90 block">Saved Jobs</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-foreground/80" />
          <h2 className="text-[17px] font-bold">Privacy Settings</h2>
        </div>
        <p className="text-muted-foreground text-[13px] mb-6 leading-relaxed">
          The selected details will be hidden from the public view, and will only be visible to employers who <strong className="text-foreground/90">shortlist</strong> you.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[14px] font-semibold text-foreground/90 group-hover:text-foreground">Hide Email Address</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={hideEmail} onChange={(e) => setHideEmail(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${hideEmail ? 'bg-brand' : 'bg-muted-foreground/20'}`}></div>
              <div className={`absolute w-4 h-4 bg-card rounded-full top-1 transition-transform ${hideEmail ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[14px] font-semibold text-foreground/90 group-hover:text-foreground">Hide Contact Number</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={hideContact} onChange={(e) => setHideContact(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${hideContact ? 'bg-brand' : 'bg-muted-foreground/20'}`}></div>
              <div className={`absolute w-4 h-4 bg-card rounded-full top-1 transition-transform ${hideContact ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[14px] font-semibold text-foreground/90 group-hover:text-foreground">Hide Location</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={hideLocation} onChange={(e) => setHideLocation(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${hideLocation ? 'bg-brand' : 'bg-muted-foreground/20'}`}></div>
              <div className={`absolute w-4 h-4 bg-card rounded-full top-1 transition-transform ${hideLocation ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[14px] font-semibold text-foreground/90 group-hover:text-foreground">Use Generic Image</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={genericImage} onChange={(e) => setGenericImage(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${genericImage ? 'bg-brand' : 'bg-muted-foreground/20'}`}></div>
              <div className={`absolute w-4 h-4 bg-card rounded-full top-1 transition-transform ${genericImage ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[14px] font-semibold text-foreground/90 group-hover:text-foreground">Hide Intro Video</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={hideVideo} onChange={(e) => setHideVideo(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${hideVideo ? 'bg-brand' : 'bg-muted-foreground/20'}`}></div>
              <div className={`absolute w-4 h-4 bg-card rounded-full top-1 transition-transform ${hideVideo ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
