"use client";

import { useEffect, useRef, useState } from "react";
import { MAPBOX_TOKEN, MAPBOX_STYLES } from "@/lib/mapbox";

export default function TripTrail({ pins = [], tripName = "" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN || pins.length === 0) return;
    let map;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLES.street,
        center: [pins[0].lng, pins[0].lat],
        zoom: 10,
        pitch: 45,
        bearing: -15,
      });

      map.on("load", () => {
        map.addSource("trip-route", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "trip-route",
          paint: {
            "line-color": "#FF6B35",
            "line-width": 8,
            "line-opacity": 0.2,
            "line-blur": 4,
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "trip-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#FF4500",
            "line-width": 3,
            "line-opacity": 0.85,
            "line-dasharray": [2, 1.5],
          },
        });
      });

      mapRef.current = map;
    };

    init();
    return () => {
      if (map) map.remove();
    };
  }, [pins]);

  const playTrail = async () => {
    if (!mapRef.current || pins.length === 0) return;
    const map = mapRef.current;
    const mapboxgl = (await import("mapbox-gl")).default;

    setIsPlaying(true);
    setIsComplete(false);
    setCurrentStep(-1);

    const coords = [];

    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i];
      setCurrentStep(i);

      // Fly camera
      await new Promise((resolve) => {
        map.flyTo({
          center: [pin.lng, pin.lat],
          zoom: 13 + (i === 0 ? 0 : 1),
          pitch: 55,
          bearing: Math.random() * 30 - 15,
          duration: i === 0 ? 2000 : 2500,
          easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        });
        map.once("moveend", () => setTimeout(resolve, 300));
      });

      // Add pin
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;border:2px solid #FF4500;animation:trailPulse 1.2s ease-out 3"></div>
          <div style="width:28px;height:28px;background:#FF4500;color:#FFF;border-radius:50%;border:2.5px solid #FFF;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 2px 10px rgba(255,69,0,0.5);position:relative;z-index:1">${i + 1}</div>
          <div style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#0A0A0A;color:#FFF;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${pin.name}</div>
        </div>`;

      new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);

      // Draw route line
      coords.push([pin.lng, pin.lat]);
      if (coords.length > 1) {
        map.getSource("trip-route")?.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: coords },
            },
          ],
        });
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    // Final overview
    const mapboxglLib = (await import("mapbox-gl")).default;
    const bounds = pins.reduce(
      (b, p) => b.extend([p.lng, p.lat]),
      new mapboxglLib.LngLatBounds(
        [pins[0].lng, pins[0].lat],
        [pins[0].lng, pins[0].lat],
      ),
    );
    map.fitBounds(bounds, {
      padding: 80,
      maxZoom: 12,
      duration: 2000,
      pitch: 30,
    });

    setIsPlaying(false);
    setIsComplete(true);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
        }}
      >
        {!isPlaying && !isComplete && (
          <button
            onClick={playTrail}
            className="btn-orange"
            style={{
              padding: "12px 28px",
              fontSize: 15,
              boxShadow: "0 4px 20px rgba(255,69,0,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ▶ Play Trip Trail
          </button>
        )}
        {isPlaying && (
          <div
            style={{
              background: "#FFF",
              borderRadius: 50,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            📍 Stop {currentStep + 1} of {pins.length}:{" "}
            {pins[currentStep]?.name}
          </div>
        )}
        {isComplete && (
          <>
            <div
              style={{
                background: "#22C55E",
                color: "#FFF",
                borderRadius: 50,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ✅ Trip Complete!
            </div>
            <button
              onClick={() => {
                setIsComplete(false);
                setCurrentStep(-1);
              }}
              style={{
                background: "#FFF",
                border: "1.5px solid var(--border)",
                borderRadius: 50,
                padding: "10px 20px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              ↺ Replay
            </button>
          </>
        )}
      </div>

      {/* Progress dots */}
      {currentStep >= 0 && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
            zIndex: 10,
            background: "rgba(255,255,255,0.9)",
            padding: "8px 16px",
            borderRadius: 50,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {pins.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i <= currentStep ? "#FF4500" : "#E5E7EB",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes trailPulse {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
