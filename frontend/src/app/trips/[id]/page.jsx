"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { tripsAPI, externalAPI } from "@/lib/api";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Trash2,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Cloud,
  Globe,
} from "lucide-react";
import FlatMap from "@/components/map/FlatMap";
import TripTrail from "@/components/map/TripTrail";
import { exportTripPDF } from "@/lib/exportPDF";
import { exportItineraryPdf } from "@/lib/exportPdf";
import { usePreferenceStore } from "@/store/preferenceStore";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(0);
  const [showTrail, setShowTrail] = useState(false);
  const { tempUnit, destinationCurrency } = usePreferenceStore();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    fetchTrip();
  }, [id, isAuthenticated]);

  const fetchTrip = async () => {
    try {
      const { data } = await tripsAPI.getById(id);
      setTrip(data.data);
      try {
        const geo = await externalAPI.geocode(data.data.destination);
        if (geo.data.data) {
          const wx = await externalAPI.weather(
            geo.data.data.lat,
            geo.data.data.lng,
          );
          setWeather(wx.data.data);
        }
      } catch {}
    } catch {
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );
  if (!trip) return null;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* ─── LEFT PANEL ─── */}
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          overflowY: "auto",
          borderRight: "1px solid var(--border-light)",
          background: "#FFF",
        }}
        className="lg:max-w-[620px]"
      >
        {/* Top actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <button
            onClick={() => router.push("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => trip && exportItineraryPdf(trip)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 10,
                border: "1.5px solid var(--orange)",
                background: "var(--orange-bg)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--orange)",
                fontFamily: "inherit",
              }}
            >
              📥 Download PDF
            </button>
            <button
              onClick={() => trip && exportTripPDF(trip)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "#FFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "#FFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={async () => {
                if (confirm("Delete?")) {
                  await tripsAPI.delete(id);
                  router.push("/profile");
                }
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "#FFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Trip header */}
        <div style={{ padding: "24px 24px 0" }}>
          {trip.startDate && (
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                background: "#F5F5F5",
                padding: "4px 12px",
                borderRadius: 99,
              }}
            >
              {new Date(trip.startDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {trip.endDate &&
                ` – ${new Date(trip.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`}
            </span>
          )}
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            {trip.title}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            {trip.budget?.total > 0 && (
              <span>
                💰 {trip.budget.currency} {trip.budget.total}
              </span>
            )}
            <span>📍 {trip.destination}</span>
            <span style={{ textTransform: "capitalize" }}>• {trip.status}</span>
            {trip.aiGenerated && <span>• ✨ AI Generated</span>}
          </div>
        </div>

        {/* Info grid */}
        {weather && (
          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <Cloud size={16} style={{ color: "var(--orange)" }} />{" "}
              {Math.round(
                tempUnit === "F" ? (weather.temp * 9) / 5 + 32 : weather.temp,
              )}
              °{tempUnit} — {weather.description}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              💧 Humidity: {weather.humidity}%
            </div>
          </div>
        )}

        {/* Itinerary */}
        <div style={{ padding: "0 24px 32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              marginTop: 16,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              Itinerary
            </h2>
          </div>

          {trip.itinerary && trip.itinerary.length > 0 ? (
            trip.itinerary.map((day, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  border: "1px solid var(--border-light)",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === i ? -1 : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 20px",
                    background: expandedDay === i ? "var(--orange-bg)" : "#FFF",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      Day {day.day || i + 1}
                    </span>
                    {day.weather && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginLeft: 12,
                        }}
                      >
                        {day.weather.temp}° {day.weather.description}
                      </span>
                    )}
                  </div>
                  {expandedDay === i ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                {expandedDay === i && day.activities && (
                  <div style={{ padding: "12px 20px 20px" }}>
                    {day.activities.map((act, j) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          gap: 14,
                          padding: "12px 0",
                          borderBottom:
                            j < day.activities.length - 1
                              ? "1px solid var(--border-light)"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#0A0A0A",
                            color: "#FFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {j + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              margin: 0,
                            }}
                          >
                            {act.name}
                          </p>
                          {act.description && (
                            <p
                              style={{
                                fontSize: 13,
                                color: "var(--text-secondary)",
                                margin: "4px 0 0",
                                lineHeight: 1.5,
                              }}
                            >
                              {act.description}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              marginTop: 6,
                              fontSize: 12,
                              color: "var(--text-muted)",
                            }}
                          >
                            {act.time && (
                              <span>
                                <Clock
                                  size={11}
                                  style={{ display: "inline", marginRight: 3 }}
                                />
                                {act.time}
                              </span>
                            )}
                            {act.cost?.amount > 0 && (
                              <span>
                                <DollarSign
                                  size={11}
                                  style={{ display: "inline", marginRight: 2 }}
                                />
                                {act.cost.currency} {act.cost.amount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Calendar
                size={40}
                style={{ color: "#D1D5DB", margin: "0 auto 12px" }}
              />
              <p style={{ color: "var(--text-secondary)" }}>No itinerary yet</p>
              <button
                onClick={() => router.push("/chat")}
                className="btn-orange"
                style={{ padding: "10px 24px", fontSize: 14, marginTop: 12 }}
              >
                Generate with AI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL — Map / Trip Trail ─── */}
      <div
        className="hidden lg:block"
        style={{ flex: 1, position: "relative" }}
      >
        {showTrail ? (
          <TripTrail
            pins={(trip.itinerary || []).flatMap((day, di) =>
              (day.activities || [])
                .filter((a) => a.location?.lat)
                .map((act, ai) => ({
                  id: di * 100 + ai + 1,
                  name: act.name,
                  lat: act.location.lat,
                  lng: act.location.lng,
                  day: di + 1,
                })),
            )}
            tripName={trip.title}
          />
        ) : (
          <FlatMap
            destination={trip.destination}
            activities={(trip.itinerary || []).flatMap((day) =>
              (day.activities || []).map((act) => ({
                name: act.name,
                description: act.description,
                time: act.time,
                location: act.location,
              })),
            )}
          />
        )}
        <button
          onClick={() => setShowTrail(!showTrail)}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
            background: "#FFF",
            border: "1.5px solid var(--border)",
            borderRadius: 50,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {showTrail ? "← Back to Map" : "▶ Play Trip Trail"}
        </button>
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
}
