"use client";

import { useEffect, useRef, useState } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function FlatMap({ destination, activities = [] }) {
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
        style: "mapbox://styles/mapbox/streets-v12",
        center: [0, 20],
        zoom: 2,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right",
      );

      map.on("load", () => setLoaded(true));
      mapRef.current = map;
    };

    initMap();
    return () => {
      if (map) map.remove();
    };
  }, []);

  // Fly to destination
  useEffect(() => {
    if (!mapRef.current || !destination || !loaded) return;

    const fly = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
        );
        const data = await res.json();
        if (data.features?.[0]) {
          const [lng, lat] = data.features[0].center;
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 12,
            duration: 2000,
          });
        }
      } catch {}
    };
    fly();
  }, [destination, loaded]);

  // Add numbered activity pins
  useEffect(() => {
    if (!mapRef.current || !loaded || activities.length === 0) return;

    const addPins = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const bounds = new mapboxgl.LngLatBounds();

      activities.forEach((act, i) => {
        if (!act.location?.lat || !act.location?.lng) return;
        const el = document.createElement("div");
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: #0A0A0A; color: #FFF;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; border: 2px solid #FFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;
        `;
        el.textContent = String(i + 1);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding:8px;font-family:inherit"><strong>${act.name}</strong><br/><span style="color:#6B7280;font-size:12px">${act.time || ""} · ${act.description?.slice(0, 60) || ""}</span></div>`,
        );

        new mapboxgl.Marker(el)
          .setLngLat([act.location.lng, act.location.lat])
          .setPopup(popup)
          .addTo(mapRef.current);

        bounds.extend([act.location.lng, act.location.lat]);
      });

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: 60,
          maxZoom: 14,
          duration: 1500,
        });
      }
    };

    addPins();
  }, [activities, loaded]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="skeleton"
            style={{ width: 100, height: 100, borderRadius: 12 }}
          />
        </div>
      )}
    </div>
  );
}
