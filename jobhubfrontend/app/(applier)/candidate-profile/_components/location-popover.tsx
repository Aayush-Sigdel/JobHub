"use client";

import { useState, type ReactElement } from "react";
import { MapPin, Pencil, Navigation, Search, X } from "lucide-react";
import { Location } from "@/types/user";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationMap } from "./location-map";

interface LocationPopoverProps {
  profileLocation: Location | null;
  setProfileLocation: (loc: Location) => void;
  className?: string;
  trigger?: ReactElement;
  description?: string;
}

export function LocationPopover({
  profileLocation,
  setProfileLocation,
  className = "",
  trigger,
  description = "Set your location so employers know your timezone.",
}: LocationPopoverProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [tempLocation, setTempLocation] = useState<Location>(
    profileLocation || { city: "", state: "", country: "" },
  );

  const [mapLat, setMapLat] = useState<number>(27.7172);
  const [mapLon, setMapLon] = useState<number>(85.324);

  const handleOpen = () => {
    setTempLocation(profileLocation || { city: "", state: "", country: "" });
    setIsLocationOpen(true);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setMapLat(latitude);
          setMapLon(longitude);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          const address = data.address;
          if (address) {
            setTempLocation({
              city:
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                "",
              state:
                address.state ||
                address.province ||
                address.region ||
                address.state_district ||
                address.county ||
                "",
              country: address.country || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch location data", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Error getting location", error);
        setIsLocating(false);
      },
    );
  };

  const handleMapClick = async (lat: number, lon: number) => {
    setMapLat(lat);
    setMapLon(lon);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      );
      const data = await res.json();
      const address = data.address;
      if (address) {
        setTempLocation({
          city:
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "",
          state:
            address.state ||
            address.province ||
            address.region ||
            address.state_district ||
            address.county ||
            "",
          country: address.country || "",
        });
      }
    } catch (error) {
      console.error("Failed to reverse geocode", error);
    }
  };

  const saveLocation = () => {
    setProfileLocation(tempLocation);
    setIsLocationOpen(false);
  };

  return (
    <Popover open={isLocationOpen} onOpenChange={(open) => { if (open) handleOpen(); else setIsLocationOpen(false); }}>
      <PopoverTrigger asChild>
        {trigger || <button
          type="button"
          onClick={handleOpen}
          className={`flex items-center gap-2 cursor-pointer text-left focus:outline-none group ${className}`}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-foreground flex items-center justify-center shrink-0 border border-border group-hover:bg-primary/20 transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {profileLocation?.city || profileLocation?.country ? (
              <span className="text-sm font-bold text-foreground truncate block">
                {profileLocation.city}
                {profileLocation.city && profileLocation.country ? ", " : ""}
                {profileLocation.state ? profileLocation.state + ", " : ""}
                {profileLocation.country}
              </span>
            ) : (
              <span className="text-sm font-medium text-muted-foreground block">
                Select location on map or search...
              </span>
            )}
          </div>
          <Pencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </button>}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[360px] max-w-[calc(100vw-2rem)] sm:w-[400px] p-0 bg-popover text-popover-foreground border border-border shadow-xl rounded-xl flex flex-col overflow-hidden z-[100]"
      >
        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-foreground text-sm">Location Pin</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {description}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close location picker"
            onClick={() => setIsLocationOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-48 w-full border-b border-border bg-muted relative z-0">
          <LocationMap
            onLocationSelect={handleMapClick}
            defaultLat={mapLat}
            defaultLon={mapLon}
          />
        </div>

        <div className="p-4 space-y-3.5 max-h-[280px] overflow-y-auto">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 text-foreground font-bold text-xs rounded-xl border border-border hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isLocating ? "Detecting location..." : "Use Current GPS Location"}</span>
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={tempLocation.city}
              onChange={(e) =>
                setTempLocation({ ...tempLocation, city: e.target.value })
              }
              placeholder="Search city..."
              className="pl-9 bg-muted/30 border-border text-foreground focus-visible:ring-ring h-10 text-sm rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                State / Province
              </label>
              <Input
                value={tempLocation.state || ""}
                onChange={(e) =>
                  setTempLocation({ ...tempLocation, state: e.target.value })
                }
                placeholder="State"
                className="bg-muted/30 border-border text-foreground focus-visible:ring-ring h-9 text-xs rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                Country
              </label>
              <Input
                value={tempLocation.country}
                onChange={(e) =>
                  setTempLocation({ ...tempLocation, country: e.target.value })
                }
                placeholder="Country"
                className="bg-muted/30 border-border text-foreground focus-visible:ring-ring h-9 text-xs rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="p-3.5 border-t border-border bg-muted/30 flex justify-end gap-2">
          <button
            type="button"
            className="px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsLocationOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors cursor-pointer shadow-xs"
            onClick={saveLocation}
          >
            Confirm Location
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
