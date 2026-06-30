"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LocationMapInner = dynamic(() => import("./location-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-muted-foreground/20 animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground font-medium">Loading Map...</span>
    </div>
  ),
});

interface LocationMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
  defaultLat?: number;
  defaultLon?: number;
}

export function LocationMap(props: LocationMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-48 w-full bg-muted-foreground/20 animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground font-medium">Loading Map...</span>
    </div>
  );

  return <LocationMapInner {...props} />;
}
