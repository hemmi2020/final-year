"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usersAPI, tripsAPI } from "@/lib/api";
import { communityAPI } from "@/lib/api";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import AvatarUploader from "@/components/profile/AvatarUploader";
import PasswordChanger from "@/components/profile/PasswordChanger";
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
  Phone,
  X,
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [originalValues, setOriginalValues] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "", phone: "" });
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
      setLoginOpen(true);
      return;
    }
    Promise.all([
      usersAPI.getProfile().then(({ data }) => {
        setProfile(data.data);
        setSettingsForm({
          name: data.data.name || "",
          email: data.data.email || "",
        });
        setEditForm({
          name: data.data.name || "",
          bio: data.data.bio || "",
          phone: data.data.phone || "",
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

  const handleAvatarUpload = async (base64) => {
    await usersAPI.uploadAvatar({ avatar: base64 });
    updateUser({ avatar: base64 });
    setProfile((p) => ({ ...p, avatar: base64 }));
  };

  const enterEditMode = () => {
    const snapshot = {
      name: profile?.name || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
    };
    setOriginalValues(snapshot);
    setEditForm(snapshot);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile({
        name: editForm.name,
        bio: editForm.bio,
        phone: editForm.phone,
      });
      updateUser({
        name: editForm.name,
        bio: editForm.bio,
        phone: editForm.phone,
      });
      setProfile((p) => ({
        ...p,
        name: editForm.name,
        bio: editForm.bio,
        phone: editForm.phone,
      }));
      setEditMode(false);
    } catch {}
    setSaving(false);
  };

  const handleCancelEdit = () => {
    if (originalValues) setEditForm(originalValues);
    setEditMode(false);
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      await usersAPI.updatePreferences(prefs);
      updateUser({ preferences: prefs });
      const prefStore =
        require("@/store/preferenceStore").usePreferenceStore.getState();
      if (prefs.preferredCurrency)
        prefStore.setDestinationCurrency(prefs.preferredCurrency);
      if (prefs.temperatureUnit)
        prefStore.setTempUnit(prefs.temperatureUnit === "imperial" ? "F" : "C");
    } catch {}
    setSaving(false);
  };

  const toggleArr = (arr, val) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  if (!isAuthenticated)
    return (
      <>
        <LoginModal
          isOpen={loginOpen}
          onClose={() => {
            setLoginOpen(false);
            router.push("/");
          }}
          onSwitchToRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
        />
        <RegisterModal
          isOpen={registerOpen}
          onClose={() => {
            setRegisterOpen(false);
            router.push("/");
          }}
          onSwitchToLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
        />
      </>
    );

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );

  const uniqueDestinations = [...new Set(trips.map((t) => t.destination))]
    .length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* ─── COVER BANNER ─── */}
      <div
        style={{
          height: 220,
          background:
            "linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #F7C948 100%)",
          borderRadius: "0 0 24px 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "0 0 24px 24px",
            background:
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* ─── PROFILE HEADER CARD ─── */}
      <div
        style={{
          margin: "-64px 24px 0",
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "0 32px 32px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Avatar centered at top */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: -48,
          }}
        >
          <AvatarUploader
            currentAvatar={profile?.avatar}
            userName={profile?.name}
            onUpload={handleAvatarUpload}
          />

          {/* Name */}
          <div style={{ textAlign: "center", marginTop: 16, width: "100%" }}>
            {editMode ? (
              <input
                className="input-field"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  textAlign: "center",
                  maxWidth: 340,
                  margin: "0 auto",
                  display: "block",
                }}
              />
            ) : (
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {profile?.name}
              </h1>
            )}

            {/* Email + Member since */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                }}
              >
                <Mail size={14} style={{ color: "var(--orange)" }} />
                {profile?.email}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                }}
              >
                <Calendar size={14} style={{ color: "var(--orange)" }} />
                Member since{" "}
                {new Date(profile?.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Bio */}
            {editMode ? (
              <input
                className="input-field"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                placeholder="Write a short bio..."
                maxLength={200}
                style={{
                  fontSize: 14,
                  marginTop: 10,
                  maxWidth: 440,
                  margin: "10px auto 0",
                  display: "block",
                  textAlign: "center",
                }}
              />
            ) : (
              profile?.bio && (
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    margin: "10px 0 0",
                    lineHeight: 1.5,
                    maxWidth: 500,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {profile.bio}
                </p>
              )
            )}

            {/* Phone */}
            {editMode ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <Phone size={14} style={{ color: "var(--text-muted)" }} />
                <input
                  className="input-field"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="Phone number"
                  style={{ fontSize: 14, maxWidth: 220 }}
                />
              </div>
            ) : (
              profile?.phone && (
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    margin: "6px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Phone size={14} style={{ color: "var(--orange)" }} />
                  {profile.phone}
                </p>
              )
            )}

            {/* Edit / Save / Cancel buttons */}
            <div style={{ marginTop: 16 }}>
              {editMode ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={handleSaveEdit}
                    className="btn-orange"
                    disabled={saving}
                    style={{
                      padding: "10px 24px",
                      fontSize: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Save size={15} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-outline"
                    style={{
                      padding: "10px 24px",
                      fontSize: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <X size={15} />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={enterEditMode}
                  className="btn-outline"
                  style={{
                    padding: "10px 24px",
                    fontSize: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Edit3 size={15} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── STATS ROW ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 28,
          }}
        >
          {[
            {
              icon: <Plane size={22} />,
              value: trips.length,
              label: "Trips Planned",
            },
            {
              icon: <Globe size={22} />,
              value: uniqueDestinations,
              label: "Destinations",
            },
            {
              icon: <User size={22} />,
              value: "Active",
              label: "Member Status",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--bg-warm)",
                borderRadius: 16,
                padding: "20px 16px",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--orange-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  color: "var(--orange)",
                }}
              >
                {s.icon}
              </div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  margin: "2px 0 0",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TAB BAR ─── */}
      <div style={{ margin: "32px 24px 0" }}>
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "2px solid var(--border-light)",
          }}
        >
          {[
            { key: "trips", label: "My Trips", icon: <Plane size={16} /> },
            {
              key: "settings",
              label: "Settings",
              icon: <Settings size={16} />,
            },
            {
              key: "preferences",
              label: "Preferences",
              icon: <Globe size={16} />,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color:
                  tab === t.key ? "var(--orange)" : "var(--text-secondary)",
                borderBottom:
                  tab === t.key
                    ? "2.5px solid var(--orange)"
                    : "2.5px solid transparent",
                marginBottom: -2,
                transition: "color 0.2s ease",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div style={{ margin: "0 24px" }}>
        {/* ─── MY TRIPS TAB ─── */}
        {tab === "trips" && (
          <div style={{ padding: "32px 0" }}>
            {trips.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 24px",
                  background: "var(--bg-warm)",
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "var(--orange-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <MapPin size={36} style={{ color: "var(--orange)" }} />
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  No trips yet
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: 28,
                    fontSize: 15,
                    maxWidth: 360,
                    marginLeft: "auto",
                    marginRight: "auto",
                    lineHeight: 1.5,
                  }}
                >
                  Start planning your first adventure and explore amazing
                  destinations around the world.
                </p>
                <button
                  onClick={() => router.push("/planner")}
                  className="btn-orange"
                  style={{
                    padding: "14px 32px",
                    fontSize: 15,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Plane size={18} />
                  Start Planning
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 24,
                }}
              >
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 18,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      minHeight: 340,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(0,0,0,0.12)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0,0,0,0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Card header gradient */}
                    <div
                      style={{
                        height: 140,
                        background:
                          "linear-gradient(135deg, #FF4500 0%, #FF6B35 60%, #F7C948 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.12) 0%, transparent 50%)",
                        }}
                      />
                      <Globe
                        size={48}
                        style={{
                          color: "rgba(255,255,255,0.25)",
                          position: "relative",
                        }}
                      />
                    </div>

                    {/* Card body */}
                    <div
                      style={{
                        padding: "20px 22px 22px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 6,
                          lineHeight: 1.3,
                        }}
                      >
                        {trip.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-secondary)",
                          marginBottom: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <MapPin
                          size={14}
                          style={{ color: "var(--orange)", flexShrink: 0 }}
                        />
                        {trip.destination}
                      </p>
                      {trip.startDate && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Calendar size={13} style={{ flexShrink: 0 }} />
                          {new Date(trip.startDate).toLocaleDateString()}
                          {trip.endDate &&
                            ` – ${new Date(trip.endDate).toLocaleDateString()}`}
                        </p>
                      )}

                      {/* Badges */}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            padding: "4px 14px",
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
                              fontSize: 12,
                              padding: "4px 14px",
                              borderRadius: 99,
                              background: "#E8F5E9",
                              color: "#2E7D32",
                              fontWeight: 600,
                            }}
                          >
                            ✨ AI Generated
                          </span>
                        )}
                      </div>

                      {/* Spacer */}
                      <div style={{ flex: 1, minHeight: 16 }} />

                      {/* Action buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() => router.push(`/trips/${trip._id}`)}
                          className="btn-orange"
                          style={{
                            padding: "10px 20px",
                            fontSize: 14,
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <Plane size={15} />
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
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: trip.isPublic
                              ? "1.5px solid var(--orange)"
                              : "1.5px solid var(--border)",
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
                            transition: "all 0.2s ease",
                            flexShrink: 0,
                          }}
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          title="Delete trip"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: "1.5px solid var(--border)",
                            background: "#FFF",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)",
                            transition: "all 0.2s ease",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#EF4444";
                            e.currentTarget.style.borderColor = "#FCA5A5";
                            e.currentTarget.style.background = "#FEF2F2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background = "#FFF";
                          }}
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
          <div style={{ padding: "32px 0", maxWidth: 560 }}>
            {/* Personal Information Section */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 28px 32px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--orange-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--orange)",
                  }}
                >
                  <User size={18} />
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--text-primary)",
                  }}
                >
                  Personal Information
                </h3>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "var(--text-body)",
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
                    marginBottom: 8,
                    color: "var(--text-body)",
                  }}
                >
                  Email Address
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
                style={{
                  padding: "12px 28px",
                  fontSize: 15,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Change Password Section */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 28px 32px",
              }}
            >
              <PasswordChanger
                isOAuthUser={!profile?.password && !!profile?.googleId}
              />
            </div>
          </div>
        )}

        {/* ─── PREFERENCES TAB ─── */}
        {tab === "preferences" && (
          <div style={{ padding: "32px 0", maxWidth: 640 }}>
            {/* Dietary Preferences */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 28px 32px",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "var(--text-primary)",
                }}
              >
                🍽️ Dietary Preferences
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {DIETARY.map((d) => {
                  const isActive = prefs.dietary.includes(d.toLowerCase());
                  return (
                    <button
                      key={d}
                      onClick={() =>
                        setPrefs({
                          ...prefs,
                          dietary: toggleArr(prefs.dietary, d.toLowerCase()),
                        })
                      }
                      style={{
                        padding: "10px 22px",
                        borderRadius: 50,
                        fontSize: 14,
                        fontWeight: 600,
                        border: "2px solid",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        background: isActive ? "var(--orange)" : "#FFF",
                        color: isActive ? "#FFF" : "var(--text-body)",
                        borderColor: isActive
                          ? "var(--orange)"
                          : "var(--border)",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Budget */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 28px 32px",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "var(--text-primary)",
                }}
              >
                💰 Travel Budget
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["budget", "moderate", "luxury"].map((b) => {
                  const isActive = prefs.budget === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setPrefs({ ...prefs, budget: b })}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 50,
                        fontSize: 14,
                        fontWeight: 600,
                        border: "2px solid",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        background: isActive ? "var(--orange)" : "#FFF",
                        color: isActive ? "#FFF" : "var(--text-body)",
                        borderColor: isActive
                          ? "var(--orange)"
                          : "var(--border)",
                      }}
                    >
                      {b === "budget"
                        ? "💰 Budget"
                        : b === "moderate"
                          ? "💳 Mid-range"
                          : "💎 Luxury"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 28px 32px",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "var(--text-primary)",
                }}
              >
                ✨ Interests
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {INTERESTS.map((i) => {
                  const val = i.split(" ")[0].toLowerCase();
                  const isActive = prefs.interests.includes(val);
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
                        padding: "10px 22px",
                        borderRadius: 50,
                        fontSize: 14,
                        fontWeight: 600,
                        border: "2px solid",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        background: isActive ? "var(--orange)" : "#FFF",
                        color: isActive ? "#FFF" : "var(--text-body)",
                        borderColor: isActive
                          ? "var(--orange)"
                          : "var(--border)",
                      }}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency + Temperature */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 28px 32px",
                marginBottom: 28,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 20,
                  color: "var(--text-primary)",
                }}
              >
                ⚙️ Display Settings
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                      color: "var(--text-body)",
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
                      marginBottom: 8,
                      color: "var(--text-body)",
                    }}
                  >
                    Temperature
                  </label>
                  <div
                    style={{
                      display: "flex",
                      border: "2px solid var(--border)",
                      borderRadius: 50,
                      overflow: "hidden",
                      width: "fit-content",
                    }}
                  >
                    {["metric", "imperial"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() =>
                          setPrefs({ ...prefs, temperatureUnit: u })
                        }
                        style={{
                          padding: "10px 22px",
                          border: "none",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
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
            </div>

            <button
              onClick={handleSavePrefs}
              className="btn-orange"
              disabled={saving}
              style={{
                padding: "14px 32px",
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
