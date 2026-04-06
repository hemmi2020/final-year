"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { communityAPI } from "@/lib/api";
import {
  MapPin,
  Calendar,
  Heart,
  Copy,
  ArrowLeft,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
  Globe,
} from "lucide-react";
import FlatMap from "@/components/map/FlatMap";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function CommunityTripPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    communityAPI
      .getTrip(id)
      .then(({ data }) => setTrip(data.data))
      .catch(() => router.push("/community"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClone = async () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    try {
      const { data } = await communityAPI.clone(id);
      router.push(`/trips/${data.data._id}`);
    } catch {}
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    try {
      await communityAPI.like(id);
      const { data } = await communityAPI.getTrip(id);
      setTrip(data.data);
    } catch {}
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );
  if (!trip) return null;

  const likeCount = (trip.tags || []).filter((t) =>
    t.startsWith("like:"),
  ).length;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* Left panel */}
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
        {/* Top bar */}
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
            onClick={() => router.push("/community")}
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
            <ArrowLeft size={16} /> Community
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                borderRadius: 50,
                border: "1.5px solid var(--border)",
                background: "#FFF",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                color: "var(--text-body)",
              }}
            >
              <Heart size={15} /> {likeCount}
            </button>
            <button
              onClick={handleClone}
              className="btn-orange"
              style={{ padding: "6px 18px", fontSize: 13 }}
            >
              <Copy size={14} style={{ marginRight: 6 }} /> Clone to My Trips
            </button>
          </div>
        </div>

        {/* Trip info */}
        <div style={{ padding: "24px 24px 0" }}>
          {/* Author */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--orange)",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {trip.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {trip.user?.name || "Traveler"}
              </p>
              <p
                style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}
              >
                Shared on {new Date(trip.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-primary)",
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
              marginBottom: 12,
            }}
          >
            <span>
              <MapPin size={13} style={{ display: "inline", marginRight: 3 }} />
              {trip.destination}
            </span>
            {trip.budget?.total > 0 && (
              <span>
                · 💰 {trip.budget.currency} {trip.budget.total}
              </span>
            )}
            {trip.aiGenerated && <span>· ✨ AI Generated</span>}
          </div>
          {trip.notes && (
            <p
              style={{
                fontSize: 15,
                color: "var(--text-body)",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              {trip.notes}
            </p>
          )}

          {trip.tags?.filter((t) => !t.startsWith("like:")).length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 20,
              }}
            >
              {trip.tags
                .filter((t) => !t.startsWith("like:"))
                .map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      background: "var(--orange-bg)",
                      color: "var(--orange)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Itinerary */}
        <div style={{ padding: "0 24px 32px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            Itinerary
          </h2>
          {(trip.itinerary || []).map((day, i) => (
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
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Day {day.day || i + 1}
                </span>
                {expandedDay === i ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {expandedDay === i && (day.activities || []).length > 0 && (
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
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
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
          ))}
        </div>

        {/* Clone CTA */}
        <div style={{ padding: "0 24px 32px", textAlign: "center" }}>
          <button
            onClick={handleClone}
            className="btn-orange"
            style={{ padding: "14px 32px", fontSize: 16, width: "100%" }}
          >
            <Copy size={18} style={{ marginRight: 8 }} /> Clone This Trip to My
            Account
          </button>
        </div>
      </div>

      {/* Right panel — Map */}
      <div
        className="hidden lg:block"
        style={{ flex: 1, position: "relative" }}
      >
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
