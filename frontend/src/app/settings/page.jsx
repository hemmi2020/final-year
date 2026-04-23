"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api, { usersAPI } from "@/lib/api";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import PasswordChanger from "@/components/profile/PasswordChanger";
import { User, Save, Settings, Globe, ArrowLeft, Trash2 } from "lucide-react";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const DESTINATION_TYPES = [
  { value: "beach", label: "🏖️ Beach" },
  { value: "mountains", label: "🏔️ Mountains" },
  { value: "historical", label: "🏛️ Historical" },
  { value: "cities", label: "🌆 Cities" },
  { value: "nature", label: "🌿 Nature" },
];

const ACCOMMODATION_TYPES = [
  { value: "budget", label: "Budget Hotel" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
  { value: "hostel", label: "Hostel" },
  { value: "resort", label: "Resort" },
];

const TRAVEL_ACTIVITIES = [
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "shopping", label: "Shopping" },
  { value: "relaxation", label: "Relaxation" },
];

const BUDGET_RANGES = [
  { value: "under_50k", label: "Under 50k PKR" },
  { value: "50k_150k", label: "50-150k" },
  { value: "150k_500k", label: "150-500k" },
  { value: "500k_plus", label: "500k+" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: null,
  });

  const [travelPrefs, setTravelPrefs] = useState({
    preferredDestinationTypes: [],
    accommodationType: null,
    travelActivities: [],
    budgetRange: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    usersAPI
      .getProfile()
      .then(({ data }) => {
        const d = data.data;
        setProfile(d);
        setSettingsForm({
          name: d.name || "",
          email: d.email || "",
          age: d.age || "",
          gender: d.gender || null,
        });
        const p = d.preferences || {};
        setTravelPrefs({
          preferredDestinationTypes: p.preferredDestinationTypes || [],
          accommodationType: p.accommodationType || null,
          travelActivities: p.travelActivities || [],
          budgetRange: p.budgetRange || null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        name: settingsForm.name,
        age: settingsForm.age === "" ? undefined : Number(settingsForm.age),
        gender: settingsForm.gender,
      };
      await usersAPI.updateProfile(payload);
      updateUser(payload);
    } catch {}
    setSaving(false);
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await usersAPI.updatePreferences(travelPrefs);
      updateUser({ preferences: { ...profile?.preferences, ...travelPrefs } });
    } catch {}
    setSavingPrefs(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/api/users/profile");
      useAuthStore.getState().logout();
      router.push("/");
    } catch {
      setDeleting(false);
    }
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

  const chipStyle = (isActive) => ({
    padding: "10px 22px",
    borderRadius: 50,
    fontSize: 14,
    fontWeight: 600,
    border: "2px solid",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    background: isActive ? "#FF4500" : "#FFF",
    color: isActive ? "#FFF" : "var(--text-body)",
    borderColor: isActive ? "#FF4500" : "var(--border)",
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* ─── COVER BANNER ─── */}
      <div
        style={{
          height: 180,
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

      {/* ─── PAGE HEADER ─── */}
      <div
        style={{
          margin: "-48px 24px 0",
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "28px 32px",
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          onClick={() => router.push("/profile")}
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
            color: "var(--text-secondary)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--orange-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--orange)",
            flexShrink: 0,
          }}
        >
          <Settings size={22} />
        </div>
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              margin: "4px 0 0",
            }}
          >
            Manage your profile and travel preferences
          </p>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          margin: "32px 24px 0",
        }}
      >
        {/* ─── LEFT COLUMN: Personal Details ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Personal Information */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: "28px 28px 32px",
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

            {/* Full Name */}
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

            {/* Email (read-only) */}
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
                Email Address
              </label>
              <input
                className="input-field"
                value={settingsForm.email}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>

            {/* Age */}
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
                Age
              </label>
              <input
                className="input-field"
                type="number"
                min={13}
                max={100}
                placeholder="Enter your age"
                value={settingsForm.age}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, age: e.target.value })
                }
                style={{ maxWidth: 160 }}
              />
            </div>

            {/* Gender */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 10,
                  color: "var(--text-body)",
                }}
              >
                Gender
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {GENDER_OPTIONS.map((g) => {
                  const isActive = settingsForm.gender === g.value;
                  return (
                    <button
                      key={g.value}
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          gender: isActive ? null : g.value,
                        })
                      }
                      style={chipStyle(isActive)}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
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

          {/* Change Password */}
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

          {/* Delete Account */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: "28px 28px 32px",
            }}
          >
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
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#DC2626",
                }}
              >
                <Trash2 size={18} />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: 0,
                  color: "#DC2626",
                }}
              >
                Delete Account
              </h3>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "12px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  background: "transparent",
                  color: "#DC2626",
                  border: "2px solid #DC2626",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                <Trash2 size={16} />
                Delete My Account
              </button>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#DC2626",
                    margin: "0 0 16px",
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  This will permanently delete all your trips, posts, and data.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      padding: "10px 24px",
                      fontSize: 14,
                      fontWeight: 700,
                      background: "#F3F4F6",
                      color: "#6B7280",
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "background 0.2s",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    style={{
                      padding: "10px 24px",
                      fontSize: 14,
                      fontWeight: 700,
                      background: "#DC2626",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 12,
                      cursor: deleting ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: deleting ? 0.7 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {deleting ? "Deleting..." : "Delete Everything"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Travel Preferences ─── */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            padding: "28px 28px 32px",
            alignSelf: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 28,
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
              <Globe size={18} />
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              Travel Preferences
            </h3>
          </div>

          {/* Preferred Destinations */}
          <div style={{ marginBottom: 28 }}>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--text-primary)",
              }}
            >
              🗺️ Preferred Destinations
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {DESTINATION_TYPES.map((d) => {
                const isActive = travelPrefs.preferredDestinationTypes.includes(
                  d.value,
                );
                return (
                  <button
                    key={d.value}
                    onClick={() =>
                      setTravelPrefs({
                        ...travelPrefs,
                        preferredDestinationTypes: toggleArr(
                          travelPrefs.preferredDestinationTypes,
                          d.value,
                        ),
                      })
                    }
                    style={chipStyle(isActive)}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accommodation Type */}
          <div style={{ marginBottom: 28 }}>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--text-primary)",
              }}
            >
              🏨 Accommodation Type
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {ACCOMMODATION_TYPES.map((a) => {
                const isActive = travelPrefs.accommodationType === a.value;
                return (
                  <button
                    key={a.value}
                    onClick={() =>
                      setTravelPrefs({
                        ...travelPrefs,
                        accommodationType: isActive ? null : a.value,
                      })
                    }
                    style={chipStyle(isActive)}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Activities */}
          <div style={{ marginBottom: 28 }}>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--text-primary)",
              }}
            >
              🎯 Travel Activities
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {TRAVEL_ACTIVITIES.map((a) => {
                const isActive = travelPrefs.travelActivities.includes(a.value);
                return (
                  <button
                    key={a.value}
                    onClick={() =>
                      setTravelPrefs({
                        ...travelPrefs,
                        travelActivities: toggleArr(
                          travelPrefs.travelActivities,
                          a.value,
                        ),
                      })
                    }
                    style={chipStyle(isActive)}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div style={{ marginBottom: 28 }}>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--text-primary)",
              }}
            >
              💰 Budget Range
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {BUDGET_RANGES.map((b) => {
                const isActive = travelPrefs.budgetRange === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() =>
                      setTravelPrefs({
                        ...travelPrefs,
                        budgetRange: isActive ? null : b.value,
                      })
                    }
                    style={chipStyle(isActive)}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSavePrefs}
            className="btn-orange"
            disabled={savingPrefs}
            style={{
              padding: "12px 28px",
              fontSize: 15,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Save size={16} />
            {savingPrefs ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
