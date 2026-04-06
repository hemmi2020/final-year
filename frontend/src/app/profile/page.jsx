"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usersAPI, tripsAPI } from "@/lib/api";
import { communityAPI } from "@/lib/api";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Trash2,
  Settings,
  Plane,
  Globe,
  Edit3,
  Save,
  Share2,
} from "lucide-react";

const INTERESTS = [
  "Culture 🎭",
  "Food 🍜",
  "Adventure 🧗",
  "Shopping 🛍️",
  "Nature 🌿",
  "Nightlife 🎉",
  "History 🏛️",
  "Wellness 🧘",
];
const DIETARY = ["None", "Halal", "Vegan", "Vegetarian", "Gluten-free"];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [tab, setTab] = useState("trips");
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: "", email: "" });
  const [prefs, setPrefs] = useState({
    dietary: [],
    budget: "moderate",
    preferredCurrency: "USD",
    temperatureUnit: "metric",
    interests: [],
    travelStyle: "solo",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/profile");
      return;
    }
    Promise.all([
      usersAPI.getProfile().then(({ data }) => {
        setProfile(data.data);
        setSettingsForm({
          name: data.data.name || "",
          email: data.data.email || "",
        });
        const p = data.data.preferences || {};
        setPrefs({
          dietary: p.dietary || [],
          budget: p.budget || "moderate",
          preferredCurrency: p.preferredCurrency || "USD",
          temperatureUnit: p.temperatureUnit || "metric",
          interests: p.interests || [],
          travelStyle: p.travelStyle || "solo",
        });
      }),
      tripsAPI.getAll().then(({ data }) => setTrips(data.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleDeleteTrip = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await tripsAPI.delete(id);
      setTrips((t) => t.filter((x) => x._id !== id));
    } catch {}
  };

  const handleShareTrip = async (id) => {
    try {
      await communityAPI.publish(id, { tags: ["shared"] });
      setTrips((t) =>
        t.map((x) => (x._id === id ? { ...x, isPublic: true } : x)),
      );
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile(settingsForm);
      updateUser(settingsForm);
    } catch {}
    setSaving(false);
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      await usersAPI.updatePreferences(prefs);
      updateUser({ preferences: prefs });
    } catch {}
    setSaving(false);
  };

  const toggleArr = (arr, val) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  if (!isAuthenticated) return null;
  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Cover photo */}
      <div
        style={{
          height: 200,
          background: "linear-gradient(135deg, #FF4500, #FF6B35, #F7C948)",
          borderRadius: "0 0 20px 20px",
          position: "relative",
        }}
      />

      {/* Profile info */}
      <div style={{ padding: "0 24px", marginTop: -48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "#FFF",
              border: "4px solid #FFF",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "var(--orange)",
            }}
          >
            {profile?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {profile?.name}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                margin: "4px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Mail size={14} /> {profile?.email}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                margin: "2px 0 0",
              }}
            >
              Member since{" "}
              {new Date(profile?.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setTab("settings")}
            className="btn-outline"
            style={{ padding: "8px 20px", fontSize: 13 }}
          >
            <Edit3 size={14} style={{ marginRight: 6 }} /> Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div
          style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}
        >
          {[
            {
              icon: <Plane size={18} />,
              value: trips.length,
              label: "Trips Planned",
            },
            {
              icon: <Globe size={18} />,
              value: [...new Set(trips.map((t) => t.destination))].length,
              label: "Destinations",
            },
            { icon: <Calendar size={18} />, value: "Active", label: "Member" },
          ].map((s) => (
            <div
              key={s.label}
              className="card"
              style={{
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                minWidth: 160,
              }}
            >
              <div style={{ color: "var(--orange)" }}>{s.icon}</div>
              <div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginTop: 32,
            borderBottom: "2px solid var(--border-light)",
          }}
        >
          {["trips", "settings", "preferences"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "12px 24px",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                color: tab === t ? "var(--orange)" : "var(--text-secondary)",
                borderBottom:
                  tab === t
                    ? "2px solid var(--orange)"
                    : "2px solid transparent",
                marginBottom: -2,
              }}
            >
              {t === "trips"
                ? "My Trips"
                : t === "settings"
                  ? "Settings"
                  : "Preferences"}
            </button>
          ))}
        </div>

        {/* ─── MY TRIPS TAB ─── */}
        {tab === "trips" && (
          <div style={{ padding: "32px 0" }}>
            {trips.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <MapPin
                  size={48}
                  style={{ color: "#D1D5DB", margin: "0 auto 16px" }}
                />
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  No trips yet
                </h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                  Start planning your first adventure!
                </p>
                <button
                  onClick={() => router.push("/planner")}
                  className="btn-orange"
                  style={{ padding: "12px 28px", fontSize: 15 }}
                >
                  Start Planning
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 20,
                }}
              >
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    className="card"
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        height: 180,
                        background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MapPin
                        size={40}
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      />
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 4,
                        }}
                      >
                        {trip.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          marginBottom: 4,
                        }}
                      >
                        <MapPin
                          size={12}
                          style={{ display: "inline", marginRight: 4 }}
                        />
                        {trip.destination}
                      </p>
                      {trip.startDate && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {new Date(trip.startDate).toLocaleDateString()}
                          {trip.endDate &&
                            ` – ${new Date(trip.endDate).toLocaleDateString()}`}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: "var(--orange-bg)",
                            color: "var(--orange)",
                            fontWeight: 600,
                          }}
                        >
                          {trip.status}
                        </span>
                        {trip.aiGenerated && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "3px 10px",
                              borderRadius: 99,
                              background: "#E8F5E9",
                              color: "#2E7D32",
                              fontWeight: 600,
                            }}
                          >
                            AI
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button
                          onClick={() => router.push(`/trips/${trip._id}`)}
                          className="btn-orange"
                          style={{ padding: "8px 18px", fontSize: 13, flex: 1 }}
                        >
                          View Trip
                        </button>
                        <button
                          onClick={() => handleShareTrip(trip._id)}
                          title={
                            trip.isPublic
                              ? "Already shared"
                              : "Share to Community"
                          }
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: trip.isPublic
                              ? "1.5px solid var(--orange)"
                              : "1px solid var(--border)",
                            background: trip.isPublic
                              ? "var(--orange-bg)"
                              : "#FFF",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: trip.isPublic
                              ? "var(--orange)"
                              : "var(--text-muted)",
                          }}
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
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
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--error)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {tab === "settings" && (
          <div style={{ padding: "32px 0", maxWidth: 500 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              Personal Information
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Full Name
              </label>
              <input
                className="input-field"
                value={settingsForm.name}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, name: e.target.value })
                }
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <input
                className="input-field"
                value={settingsForm.email}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, email: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="btn-orange"
              disabled={saving}
              style={{ padding: "12px 28px", fontSize: 15 }}
            >
              <Save size={16} style={{ marginRight: 6 }} />{" "}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* ─── PREFERENCES TAB ─── */}
        {tab === "preferences" && (
          <div style={{ padding: "32px 0", maxWidth: 600 }}>
            {/* Dietary */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Dietary Preferences
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 28,
              }}
            >
              {DIETARY.map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      dietary: toggleArr(prefs.dietary, d.toLowerCase()),
                    })
                  }
                  style={{
                    padding: "8px 18px",
                    borderRadius: 50,
                    fontSize: 14,
                    fontWeight: 500,
                    border: "1.5px solid",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    background: prefs.dietary.includes(d.toLowerCase())
                      ? "var(--orange)"
                      : "#FFF",
                    color: prefs.dietary.includes(d.toLowerCase())
                      ? "#FFF"
                      : "var(--text-body)",
                    borderColor: prefs.dietary.includes(d.toLowerCase())
                      ? "var(--orange)"
                      : "var(--border)",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Budget */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Travel Budget
            </h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {["budget", "moderate", "luxury"].map((b) => (
                <button
                  key={b}
                  onClick={() => setPrefs({ ...prefs, budget: b })}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 50,
                    fontSize: 14,
                    fontWeight: 500,
                    border: "1.5px solid",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textTransform: "capitalize",
                    background: prefs.budget === b ? "var(--orange)" : "#FFF",
                    color: prefs.budget === b ? "#FFF" : "var(--text-body)",
                    borderColor:
                      prefs.budget === b ? "var(--orange)" : "var(--border)",
                  }}
                >
                  {b === "budget"
                    ? "💰 Budget"
                    : b === "moderate"
                      ? "💳 Mid-range"
                      : "💎 Luxury"}
                </button>
              ))}
            </div>

            {/* Interests */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Interests
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 28,
              }}
            >
              {INTERESTS.map((i) => {
                const val = i.split(" ")[0].toLowerCase();
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setPrefs({
                        ...prefs,
                        interests: toggleArr(prefs.interests, val),
                      })
                    }
                    style={{
                      padding: "8px 18px",
                      borderRadius: 50,
                      fontSize: 14,
                      fontWeight: 500,
                      border: "1.5px solid",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: prefs.interests.includes(val)
                        ? "var(--orange)"
                        : "#FFF",
                      color: prefs.interests.includes(val)
                        ? "#FFF"
                        : "var(--text-body)",
                      borderColor: prefs.interests.includes(val)
                        ? "var(--orange)"
                        : "var(--border)",
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>

            {/* Currency + Temp */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Currency
                </label>
                <select
                  className="input-field"
                  value={prefs.preferredCurrency}
                  onChange={(e) =>
                    setPrefs({ ...prefs, preferredCurrency: e.target.value })
                  }
                  style={{ cursor: "pointer" }}
                >
                  {["USD", "EUR", "GBP", "PKR", "AED", "INR", "JPY"].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Temperature
                </label>
                <div
                  style={{
                    display: "flex",
                    border: "1.5px solid var(--border)",
                    borderRadius: 50,
                    overflow: "hidden",
                    width: "fit-content",
                  }}
                >
                  {["metric", "imperial"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, temperatureUnit: u })}
                      style={{
                        padding: "10px 20px",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        background:
                          prefs.temperatureUnit === u
                            ? "var(--orange)"
                            : "#FFF",
                        color:
                          prefs.temperatureUnit === u
                            ? "#FFF"
                            : "var(--text-body)",
                      }}
                    >
                      {u === "metric" ? "°C" : "°F"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSavePrefs}
              className="btn-orange"
              disabled={saving}
              style={{ padding: "12px 28px", fontSize: 15 }}
            >
              <Save size={16} style={{ marginRight: 6 }} />{" "}
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
