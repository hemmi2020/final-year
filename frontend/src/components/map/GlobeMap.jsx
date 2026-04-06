"use client";

import { useEffect, useRef, useState } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function GlobeMap({ destination, markers = [] }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    let map;
    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.accessToken = MAPBOX_TOKEN;

      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/standard",
        center: [28.97, 41.01], // Istanbul default
        zoom: 1.5,
        projection: "globe",
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right",
      );

      map.on("style.load", () => {
        map.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.6,
        });
        setLoaded(true);
      });

      // Slow auto-rotation
      const spinGlobe = () => {
        if (!map || map.isMoving()) return;
        const center = map.getCenter();
        center.lng += 0.3;
        map.easeTo({ center, duration: 1000, easing: (t) => t });
      };
      const spinInterval = setInterval(spinGlobe, 1000);

      // Stop rotation on interaction
      map.on("mousedown", () => clearInterval(spinInterval));
      map.on("touchstart", () => clearInterval(spinInterval));

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Fly to destination when it changes
  useEffect(() => {
    if (!mapRef.current || !destination || !loaded) return;

    const flyToDestination = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
        );
        const data = await res.json();
        if (data.features?.[0]) {
          const [lng, lat] = data.features[0].center;
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 5,
            duration: 3000,
            essential: true,
          });

          // Add glowing pin
          const mapboxgl = (await import("mapbox-gl")).default;

          // Remove old markers
          document.querySelectorAll(".mapbox-pin").forEach((el) => el.remove());

          const el = document.createElement("div");
          el.className = "mapbox-pin";
          el.style.cssText = `
            width: 20px; height: 20px; border-radius: 50%;
            background: #FF4500; border: 3px solid #FFF;
            box-shadow: 0 0 12px rgba(255,69,0,0.6), 0 0 24px rgba(255,69,0,0.3);
            animation: pinPulse 2s infinite;
          `;

          new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(mapRef.current);
        }
      } catch (err) {
        console.warn("Fly-to error:", err.message);
      }
    };

    flyToDestination();
  }, [destination, loaded]);

  // Add markers when they change
  useEffect(() => {
    if (!mapRef.current || !loaded || markers.length === 0) return;

    const addMarkers = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      markers.forEach((m, i) => {
        if (!m.lat || !m.lng) return;
        const el = document.createElement("div");
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: ${m.color || "#FF4500"}; color: #FFF;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; border: 2px solid #FFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        el.textContent = String(i + 1);
        new mapboxgl.Marker(el).setLngLat([m.lng, m.lat]).addTo(mapRef.current);
      });
    };

    addMarkers();
  }, [markers, loaded]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--navy)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="skeleton"
            style={{ width: 120, height: 120, borderRadius: "50%" }}
          />
        </div>
      )}
      <style jsx global>{`
        @keyframes pinPulse {
          0% {
            box-shadow:
              0 0 12px rgba(255, 69, 0, 0.6),
              0 0 24px rgba(255, 69, 0, 0.3);
          }
          50% {
            box-shadow:
              0 0 20px rgba(255, 69, 0, 0.8),
              0 0 40px rgba(255, 69, 0, 0.4);
          }
          100% {
            box-shadow:
              0 0 12px rgba(255, 69, 0, 0.6),
              0 0 24px rgba(255, 69, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
