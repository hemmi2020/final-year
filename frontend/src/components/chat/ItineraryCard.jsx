"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { externalAPI, tripsAPI } from "@/lib/api";
import {
  parsePriceRaw,
  recalculateDates,
  calculateCosts,
} from "./itinerary-utils";

/**
 * ItineraryCard — Rich right-panel display for a generated trip itinerary.
 *
 * Task 3.1: Hero image, trip summary stats, route bar, and sticky action buttons.
 * Flight/hotel/day cards will be added in Task 3.2.
 *
 * @param {Object} props
 * @param {Object} props.itinerary      - Full itinerary data from API
 * @param {string|null} props.tripId    - MongoDB _id after save
 * @param {string} props.origin         - Origin city
 * @param {string} props.destination    - Destination city
 * @param {Function} props.onSave       - Save trip callback
 * @param {Function} props.onShare      - Share to community callback
 * @param {Function} props.onModify     - Modify plan callback
 * @param {boolean} props.isSaved       - Whether the trip has been saved
 */
export default function ItineraryCard({
  itinerary,
  tripId,
  origin,
  destination,
  onSave,
  onShare,
  onModify,
  isSaved = false,
}) {
  const [imageError, setImageError] = useState(false);
  const [expandedDay, setExpandedDay] = useState(0);

  // Flight selection state
  const [flightSelected, setFlightSelected] = useState(false);
  const [returnFlightSelected, setReturnFlightSelected] = useState(false);

  // Flight modifier state (outbound)
  const [flightModifierOpen, setFlightModifierOpen] = useState(false);
  const [flightSearchDate, setFlightSearchDate] = useState("");
  const [flightTimePreference, setFlightTimePreference] = useState("any");
  const [flightStopsFilter, setFlightStopsFilter] = useState("any");
  const [flightResults, setFlightResults] = useState([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState(null);
  const [selectedFlightId, setSelectedFlightId] = useState(null);

  // Return flight modifier state
  const [returnFlightModifierOpen, setReturnFlightModifierOpen] =
    useState(false);
  const [returnFlightSearchDate, setReturnFlightSearchDate] = useState("");
  const [returnFlightTimePreference, setReturnFlightTimePreference] =
    useState("any");
  const [returnFlightStopsFilter, setReturnFlightStopsFilter] = useState("any");
  const [returnFlightResults, setReturnFlightResults] = useState([]);
  const [returnFlightLoading, setReturnFlightLoading] = useState(false);
  const [returnFlightError, setReturnFlightError] = useState(null);
  const [selectedReturnFlightId, setSelectedReturnFlightId] = useState(null);

  // Hotel selection state
  const [hotelSelected, setHotelSelected] = useState(false);

  // Hotel modifier state
  const [hotelModifierOpen, setHotelModifierOpen] = useState(false);
  const [hotelBudget, setHotelBudget] = useState("any");
  const [hotelStars, setHotelStars] = useState("any");
  const [hotelLocation, setHotelLocation] = useState("any");
  const [hotelResults, setHotelResults] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // Local mutable itinerary (cloned from prop on first modifier action)
  const [localItinerary, setLocalItinerary] = useState(null);

  // Use localItinerary if available, otherwise fall back to prop
  const activeItinerary = localItinerary || itinerary;

  // Helper to ensure localItinerary is initialized before modifications
  const ensureLocalItinerary = () => {
    if (!localItinerary) {
      const cloned = JSON.parse(JSON.stringify(itinerary));
      setLocalItinerary(cloned);
      return cloned;
    }
    return localItinerary;
  };

  if (!itinerary) return null;

  const { title, heroImage, summary = {}, route = {} } = activeItinerary;

  const {
    days: totalDays = 0,
    cities = 0,
    experiences = 0,
    hotels = 0,
    transport = "flight",
  } = summary;

  const {
    origin: routeOrigin,
    destination: routeDestination,
    startDate,
    endDate,
  } = route;

  const displayOrigin = routeOrigin || origin || "Origin";
  const displayDestination = routeDestination || destination || "Destination";

  // Resolve hero image — skip deprecated/placeholder URLs, always use city fallback
  const resolvedHeroImage = (() => {
    if (
      heroImage &&
      !heroImage.includes("source.unsplash.com") &&
      !heroImage.includes("placeholder") &&
      heroImage.startsWith("https://images.unsplash.com/photo-")
    )
      return heroImage;
    return getCityImg(destination);
  })();
  const showHeroImage = resolvedHeroImage && !imageError;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Build booking URLs
  const flightFrom = activeItinerary?.flight?.from || origin || "";
  const flightTo = activeItinerary?.flight?.to || destination || "";
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(flightFrom)}+to+${encodeURIComponent(flightTo)}`;
  const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${encodeURIComponent(flightFrom)}/${encodeURIComponent(flightTo)}/`;
  const bookingHotelUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination || "")}`;
  const googleMapsUrl = (placeName) =>
    `https://www.google.com/maps/search/${encodeURIComponent(placeName)}`;

  // City-specific images for hotel/hero fallback
  const CITY_IMAGES = {
    istanbul:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80&fit=crop",
    paris:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80&fit=crop",
    dubai:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80&fit=crop",
    tokyo:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80&fit=crop",
    london:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&fit=crop",
    bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&fit=crop",
    rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80&fit=crop",
    barcelona:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80&fit=crop",
    maldives:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80&fit=crop",
    singapore:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80&fit=crop",
    karachi:
      "https://images.unsplash.com/photo-1572688824905-5b0e8c13e8d0?w=600&q=80&fit=crop",
    lahore:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80&fit=crop",
  };
  const DEFAULT_HOTEL_IMG =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&fit=crop";

  function getCityImg(dest) {
    if (!dest) return DEFAULT_HOTEL_IMG;
    const d = dest.toLowerCase();
    return (
      CITY_IMAGES[d] ||
      Object.entries(CITY_IMAGES).find(([k]) => d.includes(k))?.[1] ||
      DEFAULT_HOTEL_IMG
    );
  }

  // Resolve hotel image — skip deprecated/placeholder URLs
  const resolvedHotelImage = (() => {
    const img = activeItinerary?.hotel?.image;
    if (
      img &&
      !img.includes("source.unsplash.com") &&
      !img.includes("placeholder") &&
      img.startsWith("https://images.unsplash.com/photo-")
    )
      return img;
    return getCityImg(destination);
  })();

  const statItems = [
    { emoji: "📅", label: "Days", value: totalDays },
    { emoji: "🏙️", label: "Cities", value: cities },
    { emoji: "⭐", label: "Experiences", value: experiences },
    { emoji: "🏨", label: "Hotels", value: hotels },
    { emoji: "✈️", label: "Transport", value: transport },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "#FAFAFA",
        zIndex: 5,
      }}
    >
      {/* ── Scrollable content area ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 80,
        }}
      >
        {/* ── Hero Image Section ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 260,
            overflow: "hidden",
          }}
        >
          {showHeroImage ? (
            <img
              src={resolvedHeroImage}
              alt={`${displayDestination} destination`}
              onError={() => setImageError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
              }}
            />
          )}
          {/* Gradient overlay at bottom of hero */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            }}
          />
          {/* Title overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 24,
              right: 24,
            }}
          >
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#FFFFFF",
                margin: 0,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                lineHeight: 1.2,
              }}
            >
              {title || `${displayDestination} Trip`}
            </h2>
          </div>
        </div>

        {/* ── Trip Summary Stats Bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "16px 16px",
            margin: "16px 16px 0",
            background: "#FFFFFF",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {statItems.map((stat, idx) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                position: "relative",
                paddingRight: idx < statItems.length - 1 ? 0 : 0,
              }}
            >
              <span style={{ fontSize: 20 }}>{stat.emoji}</span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1F2937",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Route Bar ── */}
        <div
          style={{
            margin: "12px 16px 0",
            padding: "18px 20px",
            background: "#FFFFFF",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* Route path */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {/* Origin */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {displayOrigin}
            </span>

            {/* Arrow */}
            <span style={{ fontSize: 14, color: "#D1D5DB" }}>→</span>

            {/* Destination pill */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#FFFFFF",
                background: "#FF4500",
                padding: "5px 16px",
                borderRadius: 20,
              }}
            >
              {displayDestination}
            </span>

            {/* Arrow */}
            <span style={{ fontSize: 14, color: "#D1D5DB" }}>→</span>

            {/* Return origin */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {displayOrigin}
            </span>
          </div>

          {/* Travel dates */}
          {(startDate || endDate) && (
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  fontWeight: 500,
                }}
              >
                {startDate && endDate
                  ? `${formatDate(startDate)} — ${formatDate(endDate)}`
                  : startDate
                    ? `From ${formatDate(startDate)}`
                    : `Until ${formatDate(endDate)}`}
              </span>
            </div>
          )}
        </div>

        {/* ── Flight Card (Outbound) ── */}
        {activeItinerary.flight && (
          <div
            style={{
              margin: "12px 16px 0",
              padding: "18px 20px",
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: flightSelected
                ? "2px solid #FF4500"
                : "2px solid transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>✈️</span>
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: "#1F2937" }}
                >
                  {activeItinerary.flight.airline || "Airline"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Outbound
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: "#374151" }}>
                {activeItinerary.flight.from || displayOrigin} →{" "}
                {activeItinerary.flight.to || displayDestination}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {activeItinerary.flight.departure && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  🕐 {activeItinerary.flight.departure}
                </span>
              )}
              {activeItinerary.flight.duration && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  ⏱ {activeItinerary.flight.duration}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                {activeItinerary.flight.stops === 0
                  ? "Direct"
                  : `${activeItinerary.flight.stops} stop${activeItinerary.flight.stops > 1 ? "s" : ""}`}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: "#FF4500" }}>
                {activeItinerary.flight.price || "—"}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={googleFlightsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Book on Google ↗
                </a>
                <a
                  href={skyscannerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#FFFFFF",
                    color: "#374151",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Skyscanner ↗
                </a>
              </div>
            </div>

            {/* ── Outbound Flight Selection Buttons ── */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                disabled={flightSelected}
                onClick={() => setFlightSelected(true)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: flightSelected
                    ? "linear-gradient(135deg, #FF450080, #FF6B3580)"
                    : "linear-gradient(135deg, #FF4500, #FF6B35)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: flightSelected ? "default" : "pointer",
                  fontFamily: "inherit",
                  opacity: flightSelected ? 0.6 : 1,
                }}
              >
                ✓ Select This Flight
              </button>
              <button
                disabled={flightSelected}
                onClick={() => {
                  ensureLocalItinerary();
                  setFlightModifierOpen(true);
                }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E7EB",
                  background: "#FFFFFF",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: flightSelected ? "default" : "pointer",
                  fontFamily: "inherit",
                  opacity: flightSelected ? 0.6 : 1,
                }}
              >
                ✏️ Change Flight
              </button>
            </div>
          </div>
        )}

        {/* ── Outbound Flight Modifier Panel ── */}
        {flightModifierOpen && (
          <div
            style={{
              margin: "8px 16px 0",
              padding: "18px 20px",
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1.5px solid #FF4500",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1F2937",
                marginBottom: 14,
              }}
            >
              🔍 Search Alternative Flights
            </div>

            {/* Date picker */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Departure Date
              </label>
              <input
                type="date"
                value={flightSearchDate}
                onChange={(e) => setFlightSearchDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E7EB",
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: "#374151",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Time preference chips */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Preferred Time
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "morning", label: "Morning 6-12" },
                  { value: "afternoon", label: "Afternoon 12-6" },
                  { value: "evening", label: "Evening 6-10" },
                  { value: "any", label: "Any time" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setFlightTimePreference(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        flightTimePreference === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        flightTimePreference === chip.value
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      color:
                        flightTimePreference === chip.value
                          ? "#FF4500"
                          : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stops filter chips */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Stops
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "direct", label: "Direct only" },
                  { value: "1stop", label: "1 stop ok" },
                  { value: "any", label: "Any" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setFlightStopsFilter(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        flightStopsFilter === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        flightStopsFilter === chip.value
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      color:
                        flightStopsFilter === chip.value
                          ? "#FF4500"
                          : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search button */}
            <button
              disabled={flightLoading}
              onClick={async () => {
                setFlightLoading(true);
                setFlightError(null);
                setFlightResults([]);
                setSelectedFlightId(null);
                try {
                  const res = await externalAPI.flights(
                    origin,
                    destination,
                    flightSearchDate || undefined,
                    {
                      timePreference:
                        flightTimePreference !== "any"
                          ? flightTimePreference
                          : undefined,
                      stops:
                        flightStopsFilter !== "any"
                          ? flightStopsFilter
                          : undefined,
                    },
                  );
                  const results = res.data?.data || res.data?.flights || [];
                  setFlightResults(
                    Array.isArray(results) ? results.slice(0, 5) : [],
                  );
                } catch (err) {
                  setFlightError("Could not load flights. Please try again.");
                } finally {
                  setFlightLoading(false);
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                cursor: flightLoading ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: flightLoading ? 0.7 : 1,
              }}
            >
              {flightLoading ? "Searching..." : "Search New Flights"}
            </button>

            {/* Loading indicator */}
            {flightLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 0",
                  color: "#9CA3AF",
                  fontSize: 13,
                }}
              >
                ✈️ Searching for flights...
              </div>
            )}

            {/* Error message */}
            {flightError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {flightError}
              </div>
            )}

            {/* Empty results */}
            {!flightLoading &&
              !flightError &&
              flightResults.length === 0 &&
              flightSearchDate && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "#FFFBEB",
                    color: "#92400E",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  No results found. Try adjusting your filters.
                </div>
              )}

            {/* Flight results */}
            {flightResults.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {flightResults.map((flight, idx) => (
                  <button
                    key={flight.id || idx}
                    onClick={() => setSelectedFlightId(flight.id || idx)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      marginBottom: 8,
                      borderRadius: 12,
                      border:
                        selectedFlightId === (flight.id || idx)
                          ? "2px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        selectedFlightId === (flight.id || idx)
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border:
                            selectedFlightId === (flight.id || idx)
                              ? "5px solid #FF4500"
                              : "2px solid #D1D5DB",
                          display: "inline-block",
                          flexShrink: 0,
                          boxSizing: "border-box",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#1F2937",
                        }}
                      >
                        {flight.airline || "Airline"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        marginBottom: 2,
                        paddingLeft: 26,
                      }}
                    >
                      {flight.origin || flight.from || origin} →{" "}
                      {flight.destination || flight.to || destination}
                      {flight.departure ? ` · ${flight.departure}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        paddingLeft: 26,
                        marginBottom: 2,
                      }}
                    >
                      {flight.duration || ""}
                      {flight.stops != null
                        ? ` · ${flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}`
                        : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#FF4500",
                        paddingLeft: 26,
                      }}
                    >
                      {flight.price || "—"}
                    </div>
                  </button>
                ))}

                {/* Confirm button */}
                {selectedFlightId != null && (
                  <button
                    onClick={() => {
                      const selected = flightResults.find(
                        (f, idx) => (f.id || idx) === selectedFlightId,
                      );
                      if (!selected) return;
                      const current = ensureLocalItinerary();
                      const updated = {
                        ...current,
                        flight: { ...current.flight, ...selected },
                      };

                      // Recalculate dates if departure date changed
                      const newDep =
                        selected.departure?.split("T")?.[0] || flightSearchDate;
                      const finalItinerary = newDep
                        ? recalculateDates(updated, newDep)
                        : updated;

                      setLocalItinerary(finalItinerary);
                      setFlightModifierOpen(false);
                      setFlightResults([]);
                      setSelectedFlightId(null);
                      setFlightSelected(true);

                      // Async persist
                      if (tripId) {
                        tripsAPI
                          .update(tripId, { itinerary: finalItinerary })
                          .catch((err) => {
                            console.error(
                              "Failed to persist flight change:",
                              err,
                            );
                          });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      marginTop: 4,
                    }}
                  >
                    Confirm New Flight
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Transfer Card (Optional) ── */}
        {itinerary.transfer && (
          <div
            style={{
              margin: "12px 16px 0",
              padding: "16px 20px",
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>🚌</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1F2937" }}>
                Airport → Hotel Transfer
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {itinerary.transfer.price && (
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#FF4500" }}
                >
                  {itinerary.transfer.price}
                </span>
              )}
              {itinerary.transfer.duration && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  ⏱ {itinerary.transfer.duration}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Hotel Card ── */}
        {activeItinerary.hotel && (
          <div
            style={{
              margin: "12px 16px 0",
              borderRadius: 16,
              overflow: "hidden",
              background: "#FFFFFF",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: hotelSelected
                ? "2px solid #FF4500"
                : "2px solid transparent",
            }}
          >
            {/* Hotel image */}
            <div
              style={{
                width: "100%",
                height: 140,
                overflow: "hidden",
              }}
            >
              <img
                src={resolvedHotelImage}
                alt={activeItinerary.hotel.name || "Hotel"}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "block";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
                  display: "none",
                }}
              />
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}
                >
                  {activeItinerary.hotel.name || "Hotel"}
                </span>
                <a
                  href={bookingHotelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "5px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Book on Booking.com ↗
                </a>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                {activeItinerary.hotel.stars && (
                  <span style={{ fontSize: 14 }}>
                    {"⭐".repeat(activeItinerary.hotel.stars)}
                  </span>
                )}
                {activeItinerary.hotel.rating && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#10B981",
                      background: "#F0FDF4",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {activeItinerary.hotel.rating}/10 Wonderful!
                  </span>
                )}
              </div>
              {activeItinerary.hotel.address && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    margin: "0 0 8px",
                  }}
                >
                  📍 {activeItinerary.hotel.address}
                  {activeItinerary.hotel.distance
                    ? ` · ${activeItinerary.hotel.distance}`
                    : ""}
                </p>
              )}
              <span style={{ fontSize: 18, fontWeight: 800, color: "#FF4500" }}>
                {activeItinerary.hotel.pricePerNight || "—"}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#9CA3AF",
                    marginLeft: 4,
                  }}
                >
                  / night
                </span>
              </span>

              {/* ── Hotel Selection Buttons ── */}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  disabled={hotelSelected}
                  onClick={() => setHotelSelected(true)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: hotelSelected
                      ? "linear-gradient(135deg, #FF450080, #FF6B3580)"
                      : "linear-gradient(135deg, #FF4500, #FF6B35)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: hotelSelected ? "default" : "pointer",
                    fontFamily: "inherit",
                    opacity: hotelSelected ? 0.6 : 1,
                  }}
                >
                  ✓ Select This Hotel
                </button>
                <button
                  disabled={hotelSelected}
                  onClick={() => {
                    ensureLocalItinerary();
                    setHotelModifierOpen(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#FFFFFF",
                    color: "#374151",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: hotelSelected ? "default" : "pointer",
                    fontFamily: "inherit",
                    opacity: hotelSelected ? 0.6 : 1,
                  }}
                >
                  ✏️ Change Hotel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Hotel Modifier Panel ── */}
        {hotelModifierOpen && (
          <div
            style={{
              margin: "8px 16px 0",
              padding: "18px 20px",
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1.5px solid #FF4500",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1F2937",
                marginBottom: 14,
              }}
            >
              🔍 Search Alternative Hotels
            </div>

            {/* Budget chips */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Budget
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "budget", label: "Budget" },
                  { value: "mid", label: "Mid-range" },
                  { value: "luxury", label: "Luxury" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setHotelBudget(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        hotelBudget === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        hotelBudget === chip.value ? "#FFF5F2" : "#FFFFFF",
                      color: hotelBudget === chip.value ? "#FF4500" : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star rating chips */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Star Rating
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "any", label: "Any" },
                  { value: "3", label: "3★" },
                  { value: "4", label: "4★" },
                  { value: "5", label: "5★" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setHotelStars(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        hotelStars === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        hotelStars === chip.value ? "#FFF5F2" : "#FFFFFF",
                      color: hotelStars === chip.value ? "#FF4500" : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location preference chips */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Location
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "center", label: "City Center" },
                  { value: "airport", label: "Near Airport" },
                  { value: "attractions", label: "Near Attractions" },
                  { value: "any", label: "Any" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setHotelLocation(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        hotelLocation === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        hotelLocation === chip.value ? "#FFF5F2" : "#FFFFFF",
                      color:
                        hotelLocation === chip.value ? "#FF4500" : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search button */}
            <button
              disabled={hotelLoading}
              onClick={async () => {
                setHotelLoading(true);
                setHotelError(null);
                setHotelResults([]);
                setSelectedHotelId(null);
                try {
                  const checkin = activeItinerary.route?.startDate || "";
                  const checkout = activeItinerary.route?.endDate || "";
                  const res = await externalAPI.hotels(
                    destination,
                    checkin,
                    checkout,
                    {
                      budget: hotelBudget !== "any" ? hotelBudget : undefined,
                      stars: hotelStars !== "any" ? hotelStars : undefined,
                      location:
                        hotelLocation !== "any" ? hotelLocation : undefined,
                    },
                  );
                  const results = res.data?.data || res.data?.hotels || [];
                  setHotelResults(
                    Array.isArray(results) ? results.slice(0, 4) : [],
                  );
                } catch (err) {
                  setHotelError("Could not load hotels. Please try again.");
                } finally {
                  setHotelLoading(false);
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                cursor: hotelLoading ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: hotelLoading ? 0.7 : 1,
              }}
            >
              {hotelLoading ? "Searching..." : "Search Hotels"}
            </button>

            {/* Loading indicator */}
            {hotelLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 0",
                  color: "#9CA3AF",
                  fontSize: 13,
                }}
              >
                🏨 Searching for hotels...
              </div>
            )}

            {/* Error message */}
            {hotelError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {hotelError}
              </div>
            )}

            {/* Hotel results */}
            {hotelResults.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {hotelResults.map((hotel, idx) => (
                  <button
                    key={hotel.id || idx}
                    onClick={() => setSelectedHotelId(hotel.id || idx)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      marginBottom: 8,
                      borderRadius: 12,
                      border:
                        selectedHotelId === (hotel.id || idx)
                          ? "2px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        selectedHotelId === (hotel.id || idx)
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Hotel thumbnail */}
                    {hotel.image && (
                      <img
                        src={hotel.image}
                        alt={hotel.name || "Hotel"}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border:
                              selectedHotelId === (hotel.id || idx)
                                ? "5px solid #FF4500"
                                : "2px solid #D1D5DB",
                            display: "inline-block",
                            flexShrink: 0,
                            boxSizing: "border-box",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1F2937",
                          }}
                        >
                          {hotel.name || "Hotel"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          paddingLeft: 26,
                          marginBottom: 2,
                        }}
                      >
                        {hotel.stars ? "⭐".repeat(hotel.stars) : ""}
                        {hotel.rating ? ` ${hotel.rating}/10` : ""}
                      </div>
                      {hotel.address && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            paddingLeft: 26,
                            marginBottom: 2,
                          }}
                        >
                          📍 {hotel.address}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "#FF4500",
                          paddingLeft: 26,
                        }}
                      >
                        {hotel.price || hotel.pricePerNight || "—"}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#9CA3AF",
                            marginLeft: 4,
                          }}
                        >
                          / night
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Confirm button */}
                {selectedHotelId != null && (
                  <button
                    onClick={() => {
                      const selected = hotelResults.find(
                        (h, idx) => (h.id || idx) === selectedHotelId,
                      );
                      if (!selected) return;
                      const current = ensureLocalItinerary();
                      const updated = {
                        ...current,
                        hotel: {
                          ...current.hotel,
                          ...selected,
                          pricePerNight:
                            selected.price ||
                            selected.pricePerNight ||
                            current.hotel?.pricePerNight,
                        },
                      };

                      setLocalItinerary(updated);
                      setHotelModifierOpen(false);
                      setHotelResults([]);
                      setSelectedHotelId(null);
                      setHotelSelected(true);

                      // Async persist
                      if (tripId) {
                        tripsAPI
                          .update(tripId, { itinerary: updated })
                          .catch((err) => {
                            console.error(
                              "Failed to persist hotel change:",
                              err,
                            );
                          });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      marginTop: 4,
                    }}
                  >
                    Confirm Hotel
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Day-by-Day Expandable Cards ── */}
        {activeItinerary.days &&
          activeItinerary.days.map((day, dayIndex) => {
            const isExpanded = expandedDay === dayIndex;
            const activityCount = day.activities ? day.activities.length : 0;

            // Group activities by period
            const periodOrder = ["morning", "lunch", "afternoon", "dinner"];
            const groupedActivities = {};
            if (day.activities) {
              day.activities.forEach((activity) => {
                const period = activity.period || "morning";
                if (!groupedActivities[period]) {
                  groupedActivities[period] = [];
                }
                groupedActivities[period].push(activity);
              });
            }

            const periodLabels = {
              morning: "🌅 Morning",
              lunch: "🍽️ Lunch",
              afternoon: "☀️ Afternoon",
              dinner: "🌙 Dinner",
            };

            return (
              <div
                key={day.day || dayIndex}
                style={{
                  margin: "12px 16px 0",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#FFFFFF",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {/* Day header — click to expand/collapse */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? -1 : dayIndex)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {day.day || dayIndex + 1}
                    </span>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#1F2937",
                        }}
                      >
                        Day {day.day || dayIndex + 1}
                        {day.theme ? ` — ${day.theme}` : ""}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>
                          {activityCount} activit
                          {activityCount === 1 ? "y" : "ies"}
                        </span>
                        {day.weather && (
                          <span>
                            · {day.weather.temp} {day.weather.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} color="#9CA3AF" />
                  ) : (
                    <ChevronDown size={20} color="#9CA3AF" />
                  )}
                </button>

                {/* Expanded activities */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 20px 16px",
                    }}
                  >
                    {periodOrder.map((period) => {
                      const activities = groupedActivities[period];
                      if (!activities || activities.length === 0) return null;

                      return (
                        <div key={period} style={{ marginBottom: 14 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#6B7280",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              marginBottom: 8,
                            }}
                          >
                            {periodLabels[period] || period}
                          </div>
                          {activities.map((activity, actIdx) => (
                            <div
                              key={actIdx}
                              style={{
                                display: "flex",
                                gap: 12,
                                padding: "10px 0",
                                borderBottom:
                                  actIdx < activities.length - 1
                                    ? "1px solid #F3F4F6"
                                    : "none",
                              }}
                            >
                              {/* Time */}
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#9CA3AF",
                                  minWidth: 44,
                                  flexShrink: 0,
                                }}
                              >
                                {activity.time || ""}
                              </span>
                              {/* Activity details */}
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <a
                                    href={googleMapsUrl(
                                      activity.name + " " + (destination || ""),
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: "#1F2937",
                                      textDecoration: "none",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = "#FF4500";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = "#1F2937";
                                    }}
                                  >
                                    {activity.name} 📍
                                  </a>
                                  {activity.tags &&
                                    activity.tags.includes("halal") && (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          fontWeight: 700,
                                          color: "#10B981",
                                          background: "#F0FDF4",
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                        }}
                                      >
                                        ✓ halal
                                      </span>
                                    )}
                                </div>
                                {activity.description && (
                                  <p
                                    style={{
                                      fontSize: 12,
                                      color: "#6B7280",
                                      margin: "4px 0 0",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {activity.description}
                                  </p>
                                )}
                                {activity.cost &&
                                  activity.cost.amount != null && (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#FF4500",
                                        marginTop: 4,
                                        display: "inline-block",
                                      }}
                                    >
                                      {activity.cost.currency || "PKR"}{" "}
                                      {activity.cost.amount.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* ── Return Flight Card ── */}
        {activeItinerary.returnFlight && (
          <div
            style={{
              margin: "12px 16px 0",
              padding: "18px 20px",
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: returnFlightSelected
                ? "2px solid #FF4500"
                : "2px solid transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>✈️</span>
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: "#1F2937" }}
                >
                  {activeItinerary.returnFlight.airline || "Airline"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Return
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: "#374151" }}>
                {activeItinerary.returnFlight.from || displayDestination} →{" "}
                {activeItinerary.returnFlight.to || displayOrigin}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {activeItinerary.returnFlight.departure && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  🕐 {activeItinerary.returnFlight.departure}
                </span>
              )}
              {activeItinerary.returnFlight.duration && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  ⏱ {activeItinerary.returnFlight.duration}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                {activeItinerary.returnFlight.stops === 0
                  ? "Direct"
                  : `${activeItinerary.returnFlight.stops} stop${activeItinerary.returnFlight.stops > 1 ? "s" : ""}`}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: "#FF4500" }}>
                {activeItinerary.returnFlight.price || "—"}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={googleFlightsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Book on Google ↗
                </a>
                <a
                  href={skyscannerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#FFFFFF",
                    color: "#374151",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Skyscanner ↗
                </a>
              </div>
            </div>

            {/* ── Return Flight Selection Buttons ── */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                disabled={returnFlightSelected}
                onClick={() => setReturnFlightSelected(true)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: returnFlightSelected
                    ? "linear-gradient(135deg, #FF450080, #FF6B3580)"
                    : "linear-gradient(135deg, #FF4500, #FF6B35)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: returnFlightSelected ? "default" : "pointer",
                  fontFamily: "inherit",
                  opacity: returnFlightSelected ? 0.6 : 1,
                }}
              >
                ✓ Select This Flight
              </button>
              <button
                disabled={returnFlightSelected}
                onClick={() => {
                  ensureLocalItinerary();
                  setReturnFlightModifierOpen(true);
                }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E7EB",
                  background: "#FFFFFF",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: returnFlightSelected ? "default" : "pointer",
                  fontFamily: "inherit",
                  opacity: returnFlightSelected ? 0.6 : 1,
                }}
              >
                ✏️ Change Flight
              </button>
            </div>
          </div>
        )}

        {/* ── Return Flight Modifier Panel ── */}
        {returnFlightModifierOpen && (
          <div
            style={{
              margin: "8px 16px 0",
              padding: "18px 20px",
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1.5px solid #FF4500",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1F2937",
                marginBottom: 14,
              }}
            >
              🔍 Search Alternative Return Flights
            </div>

            {/* Date picker */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Return Date
              </label>
              <input
                type="date"
                value={returnFlightSearchDate}
                onChange={(e) => setReturnFlightSearchDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E7EB",
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: "#374151",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Time preference chips */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Preferred Time
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "morning", label: "Morning 6-12" },
                  { value: "afternoon", label: "Afternoon 12-6" },
                  { value: "evening", label: "Evening 6-10" },
                  { value: "any", label: "Any time" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setReturnFlightTimePreference(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        returnFlightTimePreference === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        returnFlightTimePreference === chip.value
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      color:
                        returnFlightTimePreference === chip.value
                          ? "#FF4500"
                          : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stops filter chips */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Stops
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { value: "direct", label: "Direct only" },
                  { value: "1stop", label: "1 stop ok" },
                  { value: "any", label: "Any" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setReturnFlightStopsFilter(chip.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border:
                        returnFlightStopsFilter === chip.value
                          ? "1.5px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        returnFlightStopsFilter === chip.value
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      color:
                        returnFlightStopsFilter === chip.value
                          ? "#FF4500"
                          : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search button */}
            <button
              disabled={returnFlightLoading}
              onClick={async () => {
                setReturnFlightLoading(true);
                setReturnFlightError(null);
                setReturnFlightResults([]);
                setSelectedReturnFlightId(null);
                try {
                  const res = await externalAPI.flights(
                    destination,
                    origin,
                    returnFlightSearchDate || undefined,
                    {
                      timePreference:
                        returnFlightTimePreference !== "any"
                          ? returnFlightTimePreference
                          : undefined,
                      stops:
                        returnFlightStopsFilter !== "any"
                          ? returnFlightStopsFilter
                          : undefined,
                    },
                  );
                  const results = res.data?.data || res.data?.flights || [];
                  setReturnFlightResults(
                    Array.isArray(results) ? results.slice(0, 5) : [],
                  );
                } catch (err) {
                  setReturnFlightError(
                    "Could not load flights. Please try again.",
                  );
                } finally {
                  setReturnFlightLoading(false);
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                cursor: returnFlightLoading ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: returnFlightLoading ? 0.7 : 1,
              }}
            >
              {returnFlightLoading ? "Searching..." : "Search New Flights"}
            </button>

            {/* Loading indicator */}
            {returnFlightLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 0",
                  color: "#9CA3AF",
                  fontSize: 13,
                }}
              >
                ✈️ Searching for return flights...
              </div>
            )}

            {/* Error message */}
            {returnFlightError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {returnFlightError}
              </div>
            )}

            {/* Empty results */}
            {!returnFlightLoading &&
              !returnFlightError &&
              returnFlightResults.length === 0 &&
              returnFlightSearchDate && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "#FFFBEB",
                    color: "#92400E",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  No results found. Try adjusting your filters.
                </div>
              )}

            {/* Return flight results */}
            {returnFlightResults.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {returnFlightResults.map((flight, idx) => (
                  <button
                    key={flight.id || idx}
                    onClick={() => setSelectedReturnFlightId(flight.id || idx)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      marginBottom: 8,
                      borderRadius: 12,
                      border:
                        selectedReturnFlightId === (flight.id || idx)
                          ? "2px solid #FF4500"
                          : "1.5px solid #E5E7EB",
                      background:
                        selectedReturnFlightId === (flight.id || idx)
                          ? "#FFF5F2"
                          : "#FFFFFF",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border:
                            selectedReturnFlightId === (flight.id || idx)
                              ? "5px solid #FF4500"
                              : "2px solid #D1D5DB",
                          display: "inline-block",
                          flexShrink: 0,
                          boxSizing: "border-box",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#1F2937",
                        }}
                      >
                        {flight.airline || "Airline"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        marginBottom: 2,
                        paddingLeft: 26,
                      }}
                    >
                      {flight.origin || flight.from || destination} →{" "}
                      {flight.destination || flight.to || origin}
                      {flight.departure ? ` · ${flight.departure}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        paddingLeft: 26,
                        marginBottom: 2,
                      }}
                    >
                      {flight.duration || ""}
                      {flight.stops != null
                        ? ` · ${flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}`
                        : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#FF4500",
                        paddingLeft: 26,
                      }}
                    >
                      {flight.price || "—"}
                    </div>
                  </button>
                ))}

                {/* Confirm button */}
                {selectedReturnFlightId != null && (
                  <button
                    onClick={() => {
                      const selected = returnFlightResults.find(
                        (f, idx) => (f.id || idx) === selectedReturnFlightId,
                      );
                      if (!selected) return;
                      const current = ensureLocalItinerary();
                      const updated = {
                        ...current,
                        returnFlight: { ...current.returnFlight, ...selected },
                      };

                      // Update route end date if return date changed
                      const newReturnDate =
                        selected.departure?.split("T")?.[0] ||
                        returnFlightSearchDate;
                      if (newReturnDate) {
                        updated.route = {
                          ...updated.route,
                          endDate: newReturnDate,
                        };
                      }

                      setLocalItinerary(updated);
                      setReturnFlightModifierOpen(false);
                      setReturnFlightResults([]);
                      setSelectedReturnFlightId(null);
                      setReturnFlightSelected(true);

                      // Async persist
                      if (tripId) {
                        tripsAPI
                          .update(tripId, { itinerary: updated })
                          .catch((err) => {
                            console.error(
                              "Failed to persist return flight change:",
                              err,
                            );
                          });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      marginTop: 4,
                    }}
                  >
                    Confirm New Flight
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Cost Tracker ── */}
        {(() => {
          const costs = calculateCosts(activeItinerary);
          const numNights = activeItinerary.days?.length || 0;
          const formatCost = (val) =>
            val != null ? `PKR ${val.toLocaleString()}` : "—";
          return (
            <div
              style={{
                margin: "12px 16px 0",
                padding: "18px 20px",
                background: "#FFFFFF",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1F2937",
                  marginBottom: 14,
                }}
              >
                💰 Estimated Trip Cost
              </div>
              <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                {/* Outbound Flight */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    ✈️ Outbound Flight
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    {formatCost(costs.outboundFlight)}
                  </span>
                </div>
                {/* Return Flight */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    ✈️ Return Flight
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    {formatCost(costs.returnFlight)}
                  </span>
                </div>
                {/* Hotel */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    🏨 Hotel ({numNights} night{numNights !== 1 ? "s" : ""})
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    {formatCost(costs.hotelTotal)}
                  </span>
                </div>
                {/* Food */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    🍽️ Food
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    {formatCost(costs.food)}
                  </span>
                </div>
                {/* Activities */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    🎯 Activities
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    {formatCost(costs.activities)}
                  </span>
                </div>
                {/* Divider */}
                <div
                  style={{ borderTop: "1.5px solid #E5E7EB", paddingTop: 12 }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#1F2937",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#FF4500",
                      }}
                    >
                      {costs.total > 0
                        ? `PKR ${costs.total.toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ margin: "12px 16px 0" }} />
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "#FFFFFF",
          borderTop: "1px solid #F3F4F6",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          display: "flex",
          gap: 8,
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {/* Save Trip */}
        <button
          onClick={onSave}
          disabled={isSaved}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 12,
            border: isSaved ? "1.5px solid #10B981" : "1.5px solid #E5E7EB",
            background: isSaved ? "#F0FDF4" : "#FFFFFF",
            color: isSaved ? "#10B981" : "#374151",
            fontSize: 13,
            fontWeight: 600,
            cursor: isSaved ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!isSaved) {
              e.currentTarget.style.borderColor = "#FF4500";
              e.currentTarget.style.color = "#FF4500";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaved) {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.color = "#374151";
            }
          }}
        >
          {isSaved ? "✅ Saved" : "💾 Save Trip"}
        </button>

        {/* Share to Community */}
        <button
          onClick={onShare}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #FF4500, #FF6B35)",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(255,69,0,0.25)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,69,0,0.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,69,0,0.25)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          🌍 Share to Community
        </button>

        {/* Modify Plan */}
        <button
          onClick={onModify}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 12,
            border: "1.5px solid #E5E7EB",
            background: "#FFFFFF",
            color: "#374151",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FF4500";
            e.currentTarget.style.color = "#FF4500";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.color = "#374151";
          }}
        >
          ✏️ Modify Plan
        </button>
      </div>
    </div>
  );
}
