"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usersAPI } from "@/lib/api";
import {
  Save,
  User,
  Utensils,
  Wallet,
  Thermometer,
  Heart,
  Users,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const DIETARY_OPTIONS = [
  "halal",
  "vegan",
  "vegetarian",
  "kosher",
  "gluten-free",
];
const BUDGET_OPTIONS = ["budget", "moderate", "luxury"];
const CURRENCY_OPTIONS = [
  "USD",
  "EUR",
  "GBP",
  "PKR",
  "JPY",
  "AED",
  "SAR",
  "INR",
  "CAD",
  "AUD",
];
const TEMP_OPTIONS = ["metric", "imperial"];
const INTEREST_OPTIONS = [
  "history",
  "food",
  "adventure",
  "nature",
  "culture",
  "shopping",
  "nightlife",
  "art",
  "sports",
  "photography",
];
const STYLE_OPTIONS = ["solo", "family", "couple", "group"];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    dietary: [],
    budget: "moderate",
    preferredCurrency: "USD",
    temperatureUnit: "metric",
    interests: [],
    travelStyle: "solo",
  });
  const [profile, setProfile] = useState({ name: "", email: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (user) {
      setProfile({ name: user.name || "", email: user.email || "" });
      setPrefs({
        dietary: user.preferences?.dietary || [],
        budget: user.preferences?.budget || "moderate",
        preferredCurrency: user.preferences?.preferredCurrency || "USD",
        temperatureUnit: user.preferences?.temperatureUnit || "metric",
        interests: user.preferences?.interests || [],
        travelStyle: user.preferences?.travelStyle || "solo",
      });
    }
  }, [isAuthenticated, user]);

  const toggleArray = (arr, val) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile(profile);
      updateUser(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await usersAPI.updatePreferences(prefs);
      updateUser({ preferences: prefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => router.push("/")}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => router.push("/")}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <Container className="py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
      <p className="text-neutral-600 mb-8">
        Manage your profile and travel preferences
      </p>

      {saved && (
        <div className="mb-6 p-3 bg-success-50 border border-success-200 rounded-lg text-sm text-success-700">
          Settings saved successfully!
        </div>
      )}

      {/* Profile Section */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              loading={saving}
            >
              <Save className="w-4 h-4 mr-1" /> Save Profile
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-accent-600" />
            <h2 className="text-lg font-semibold text-neutral-900">
              Travel Preferences
            </h2>
          </div>
          <p className="text-sm text-neutral-500 mb-6">
            These preferences personalize your AI recommendations, weather data,
            currency conversions, and restaurant suggestions.
          </p>

          <div className="space-y-6">
            {/* Dietary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-neutral-500" />
                <label className="text-sm font-medium text-neutral-700">
                  Dietary Preferences
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setPrefs({
                        ...prefs,
                        dietary: toggleArray(prefs.dietary, opt),
                      })
                    }
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      prefs.dietary.includes(opt)
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-neutral-500" />
                <label className="text-sm font-medium text-neutral-700">
                  Budget Level
                </label>
              </div>
              <div className="flex gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPrefs({ ...prefs, budget: opt })}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                      prefs.budget === opt
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                Preferred Currency
              </label>
              <select
                value={prefs.preferredCurrency}
                onChange={(e) =>
                  setPrefs({ ...prefs, preferredCurrency: e.target.value })
                }
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-neutral-500" />
                <label className="text-sm font-medium text-neutral-700">
                  Temperature Unit
                </label>
              </div>
              <div className="flex gap-2">
                {TEMP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPrefs({ ...prefs, temperatureUnit: opt })}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      prefs.temperatureUnit === opt
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {opt === "metric" ? "°C (Celsius)" : "°F (Fahrenheit)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setPrefs({
                        ...prefs,
                        interests: toggleArray(prefs.interests, opt),
                      })
                    }
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors capitalize ${
                      prefs.interests.includes(opt)
                        ? "bg-secondary-100 border-secondary-300 text-secondary-700"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-neutral-500" />
                <label className="text-sm font-medium text-neutral-700">
                  Travel Style
                </label>
              </div>
              <div className="flex gap-2">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPrefs({ ...prefs, travelStyle: opt })}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                      prefs.travelStyle === opt
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              variant="primary"
              onClick={handleSavePreferences}
              loading={saving}
            >
              <Save className="w-4 h-4 mr-1" /> Save Preferences
            </Button>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
}
