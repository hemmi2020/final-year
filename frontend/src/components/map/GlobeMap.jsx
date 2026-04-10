"use client";

import { useEffect, useRef, useState } from "react";
import { MAPBOX_TOKEN, MAPBOX_STYLES } from "@/lib/mapbox";

export default function GlobeMap({
  destination,
  amenityMarkers = [],
  userLocation,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [loaded, setLoaded] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;
    let map;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const initialCenter =
        userLocation?.lat && userLocation?.lng
          ? [userLocation.lng, userLocation.lat]
          : [0, 20];
      const initialZoom = userLocation?.lat && userLocation?.lng ? 3 : 2;

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLES.globe,
        projection: "globe",
        center: initialCenter,
        zoom: initialZoom,
        pitch: 0,
        antialias: true,
      });

      mapRef.current = map;

      map.on("style.load", () => {
        map.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.6,
        });
        setLoaded(true);

        // Auto-rotation
        let angle = 0;
        const rotate = () => {
          if (!map.isMoving()) {
            angle = (angle + 0.3) % 360;
            map.rotateTo(angle, { duration: 0 });
          }
          animRef.current = requestAnimationFrame(rotate);
        };
        animRef.current = requestAnimationFrame(rotate);
        map.on("mousedown", () => cancelAnimationFrame(animRef.current));
        map.on("touchstart", () => cancelAnimationFrame(animRef.current));
      });

      // Resize observer
      const observer = new ResizeObserver(() => map?.resize());
      observer.observe(containerRef.current);
    };

    init();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      markersRef.current.forEach((m) => m.remove());
      if (map) map.remove();
    };
  }, []);

  // Fly to destination
  useEffect(() => {
    if (!destination || !mapRef.current || !loaded) return;

    const flyTo = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const map = mapRef.current;

      // Stop rotation
      if (animRef.current) cancelAnimationFrame(animRef.current);

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Determine zoom based on placeType
      let zoom = 8; // default
      if (destination.placeType === "place") zoom = 11;
      else if (destination.placeType === "country") zoom = 5;

      map.flyTo({
        center: [destination.lng, destination.lat],
        zoom,
        pitch: 45,
        bearing: -12,
        duration: 3000,
        easing: (t) => t * (2 - t),
      });

      // Glowing pulse marker
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;border:2px solid #FF4500;animation:pulseRing 1.5s ease-out infinite"></div>
          <div style="width:14px;height:14px;background:#FF4500;border-radius:50%;border:2.5px solid #FFF;box-shadow:0 2px 8px rgba(255,69,0,0.5);position:relative;z-index:1"></div>
          <div style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#0A0A0A;color:#FFF;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${destination.name}</div>
        </div>`;

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map);
      markersRef.current.push(marker);
    };

    flyTo();
  }, [destination, loaded]);

  // Amenity markers
  useEffect(() => {
    if (!mapRef.current || !loaded || amenityMarkers.length === 0) return;

    const addAmenities = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const colors = {
        restaurant: "#FF6B35",
        hotel: "#6366F1",
        hospital: "#EF4444",
        atm: "#22C55E",
        shopping: "#F59E0B",
        cafe: "#92400E",
        mosque: "#10B981",
        transport: "#3B82F6",
        attraction: "#EC4899",
        pharmacy: "#8B5CF6",
      };

      amenityMarkers.forEach((a) => {
        const color = colors[a.category] || "#888";
        const el = document.createElement("div");
        el.style.cssText = `width:28px;height:28px;background:${color};border-radius:50%;border:2.5px solid #FFF;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:transform 0.2s`;
        el.textContent = a.icon || "📍";
        el.onmouseenter = () => (el.style.transform = "scale(1.2)");
        el.onmouseleave = () => (el.style.transform = "scale(1)");

        const popup = new mapboxgl.Popup({
          offset: 16,
          closeButton: false,
        }).setHTML(
          `<div style="padding:10px 14px;font-family:inherit"><div style="font-weight:600;font-size:14px">${a.name}</div><div style="font-size:12px;color:#6B7280;margin-top:4px">⭐ ${a.rating || "N/A"} · ${a.distance || ""}</div></div>`,
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([a.lng, a.lat])
          .setPopup(popup)
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      });
    };

    addAmenities();
  }, [amenityMarkers, loaded]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#1B2B4B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1e3a5f, #2a5298)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      )}
      <style jsx global>{`
        @keyframes pulseRing {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
