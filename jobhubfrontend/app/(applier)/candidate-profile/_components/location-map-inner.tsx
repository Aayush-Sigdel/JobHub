"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js/Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMapInnerProps {
  onLocationSelect: (lat: number, lon: number) => void;
  defaultLat?: number;
  defaultLon?: number;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

export default function LocationMapInner({ onLocationSelect, defaultLat = 27.7172, defaultLon = 85.3240 }: LocationMapInnerProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>([defaultLat, defaultLon]);

  const handleLocationSelect = (lat: number, lon: number) => {
    setMarkerPos([lat, lon]);
    onLocationSelect(lat, lon);
  };

  useEffect(() => {
    setMarkerPos([defaultLat, defaultLon]);
  }, [defaultLat, defaultLon]);

  return (
    <div className="h-48 w-full z-0 relative">
      <MapContainer
        center={markerPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={markerPos} />
        <MapEvents onLocationSelect={handleLocationSelect} />
        <MapUpdater lat={defaultLat} lon={defaultLon} />
      </MapContainer>
    </div>
  );
}
