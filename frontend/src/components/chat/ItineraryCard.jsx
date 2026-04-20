"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  if (!itinerary) return null;

  const { title, heroImage, summary = {}, route = {} } = itinerary;

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

  const showHeroImage = heroImage && !imageError;

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
  const flightFrom = itinerary?.flight?.from || origin || "";
  const flightTo = itinerary?.flight?.to || destination || "";
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(flightFrom)}+to+${encodeURIComponent(flightTo)}`;
  const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${encodeURIComponent(flightFrom)}/${encodeURIComponent(flightTo)}/`;
  const bookingHotelUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination || "")}`;
  const googleMapsUrl = (placeName) =>
    `https://www.google.com/maps/search/${encodeURIComponent(placeName)}`;

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
              src={heroImage}
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
        {itinerary.flight && (
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
                  {itinerary.flight.airline || "Airline"}
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
                {itinerary.flight.from || displayOrigin} →{" "}
                {itinerary.flight.to || displayDestination}
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
              {itinerary.flight.departure && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  🕐 {itinerary.flight.departure}
                </span>
              )}
              {itinerary.flight.duration && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  ⏱ {itinerary.flight.duration}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                {itinerary.flight.stops === 0
                  ? "Direct"
                  : `${itinerary.flight.stops} stop${itinerary.flight.stops > 1 ? "s" : ""}`}
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
                {itinerary.flight.price || "—"}
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
        {itinerary.hotel && (
          <div
            style={{
              margin: "12px 16px 0",
              borderRadius: 16,
              overflow: "hidden",
              background: "#FFFFFF",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Hotel image or gradient fallback */}
            <div
              style={{
                width: "100%",
                height: 140,
                overflow: "hidden",
              }}
            >
              {itinerary.hotel.image ? (
                <img
                  src={itinerary.hotel.image}
                  alt={itinerary.hotel.name || "Hotel"}
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
              ) : null}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
                  display: itinerary.hotel.image ? "none" : "block",
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
                  {itinerary.hotel.name || "Hotel"}
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
                {itinerary.hotel.stars && (
                  <span style={{ fontSize: 14 }}>
                    {"⭐".repeat(itinerary.hotel.stars)}
                  </span>
                )}
                {itinerary.hotel.rating && (
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
                    {itinerary.hotel.rating}/10 Wonderful!
                  </span>
                )}
              </div>
              {itinerary.hotel.address && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    margin: "0 0 8px",
                  }}
                >
                  📍 {itinerary.hotel.address}
                  {itinerary.hotel.distance
                    ? ` · ${itinerary.hotel.distance}`
                    : ""}
                </p>
              )}
              <span style={{ fontSize: 18, fontWeight: 800, color: "#FF4500" }}>
                {itinerary.hotel.pricePerNight || "—"}
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
            </div>
          </div>
        )}

        {/* ── Day-by-Day Expandable Cards ── */}
        {itinerary.days &&
          itinerary.days.map((day, dayIndex) => {
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
        {itinerary.returnFlight && (
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
                  {itinerary.returnFlight.airline || "Airline"}
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
                {itinerary.returnFlight.from || displayDestination} →{" "}
                {itinerary.returnFlight.to || displayOrigin}
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
              {itinerary.returnFlight.departure && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  🕐 {itinerary.returnFlight.departure}
                </span>
              )}
              {itinerary.returnFlight.duration && (
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  ⏱ {itinerary.returnFlight.duration}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                {itinerary.returnFlight.stops === 0
                  ? "Direct"
                  : `${itinerary.returnFlight.stops} stop${itinerary.returnFlight.stops > 1 ? "s" : ""}`}
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
                {itinerary.returnFlight.price || "—"}
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
          </div>
        )}

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
