import { useEffect, useRef } from "react";
import L from "leaflet";
import { CAMPUS_CENTER } from "@/lib/constants";

/** Teal pin marker matching the app primary color. */
const tealIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#008C83;transform:rotate(-45deg);
    border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  /** Read-only: just display a marker, no tap-to-pick. */
  readOnly?: boolean;
  height?: number;
}

export function LocationPicker({
  value,
  onChange,
  readOnly = false,
  height = 220,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const start = value ?? CAMPUS_CENTER;
    const map = L.map(containerRef.current, {
      center: [start.lat, start.lng],
      zoom: 15,
      zoomControl: !readOnly,
      // In read-only mode the map is a static preview: disable every touch
      // gesture so vertical page scrolling isn't hijacked on mobile (the map
      // otherwise captures the drag, blocking scroll on Android and causing
      // the "snap back" on iOS).
      dragging: !readOnly,
      touchZoom: !readOnly,
      scrollWheelZoom: !readOnly,
      doubleClickZoom: !readOnly,
      boxZoom: !readOnly,
      keyboard: !readOnly,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], {
        icon: tealIcon,
      }).addTo(map);
    }

    if (!readOnly) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng, { icon: tealIcon }).addTo(map);
        }
        onChangeRef.current(coords);
      });
    }

    // Map may render before layout settles; invalidate after mount.
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker in sync when value changes externally (read-only mode).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      markerRef.current = L.marker([value.lat, value.lng], {
        icon: tealIcon,
      }).addTo(map);
    }
    map.setView([value.lat, value.lng]);
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`w-full overflow-hidden rounded-xl border border-line${
        readOnly ? " leaflet-readonly" : ""
      }`}
    />
  );
}
