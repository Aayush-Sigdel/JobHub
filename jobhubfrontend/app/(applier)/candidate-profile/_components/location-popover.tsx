"use client";

import { useState } from "react";
import { MapPin, Pencil, Navigation, Search } from "lucide-react";
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
}

export function LocationPopover({
  profileLocation,
  setProfileLocation,
}: LocationPopoverProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [tempLocation, setTempLocation] = useState<Location>(
    profileLocation || { city: "", state: "", country: "" },
  );

  const [mapLat, setMapLat] = useState<number>(27.7172);
  const [mapLon, setMapLon] = useState<number>(85.324);

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
    <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:underline group"
          onClick={() =>
            setTempLocation(
              profileLocation || { city: "", state: "", country: "" },
            )
          }
        >
          <MapPin className="w-4 h-4 text-muted-foreground" />
          {profileLocation?.city || profileLocation?.country ? (
            <span className="dark:text-foreground/80">
              {profileLocation.city}
              {profileLocation.city && profileLocation.country ? ", " : ""}
              {profileLocation.state ? profileLocation.state + ", " : ""}
              {profileLocation.country}
            </span>
          ) : (
            <span className="text-muted-foreground">Add location</span>
          )}
          <Pencil className="w-3 h-3 ml-0.5 text-muted-foreground group-hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[360px] p-0 bg-card border border-border shadow-xl rounded-2xl flex flex-col overflow-hidden"
      >
        <div className="p-4 bg-muted border-b border-border/50 dark:border-border">
          <h3 className="font-bold text-foreground text-[15px]">Location Pin</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Set your global location so clients know your timezone.
          </p>
        </div>

        <div className="h-48 w-full border-b border-border/50 dark:border-border bg-muted-foreground/20 relative z-0">
          <LocationMap
            onLocationSelect={handleMapClick}
            defaultLat={mapLat}
            defaultLon={mapLon}
          />
        </div>

        <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary/5 text-primary font-semibold text-sm rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            <Navigation className="w-4 h-4" />
            {isLocating ? "Locating..." : "Use current location"}
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={tempLocation.city}
              onChange={(e) =>
                setTempLocation({ ...tempLocation, city: e.target.value })
              }
              placeholder="Search city..."
              className="pl-9 bg-card border-input text-foreground focus-visible:ring-ring h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                State / Province
              </label>
              <Input
                value={tempLocation.state || ""}
                onChange={(e) =>
                  setTempLocation({ ...tempLocation, state: e.target.value })
                }
                className="bg-card border-input text-foreground focus-visible:ring-ring h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                Country
              </label>
              <Input
                value={tempLocation.country}
                onChange={(e) =>
                  setTempLocation({ ...tempLocation, country: e.target.value })
                }
                className="bg-card border-input text-foreground focus-visible:ring-ring h-9 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border/50 dark:border-border bg-muted flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsLocationOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            onClick={saveLocation}
          >
            Confirm Pin
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
