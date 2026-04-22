"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  MapPin,
  Calendar,
  TrendingUp,
  MessageSquare,
  Settings,
  Plus,
  Globe,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { tripsAPI } from "@/lib/api";
import { useLocation, getCurrencySymbol } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";

// ── Helpers ──────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchAllNearbyFromBackend(lat, lng, countryCode, radius = 5000) {
  try {
    const res = await fetch(
      `${API_URL}/api/external/nearby-all?lat=${lat}&lng=${lng}&radius=${radius}&countryCode=${countryCode || ""}`,
      { signal: AbortSignal.timeout(30000) },
    );
    const json = await res.json();
    if (json.success && json.data) {
      return {
        categories: json.data,
        isMuslimCountry: json.isMuslimCountry || false,
      };
    }
  } catch {}
  return null;
}

const NEARBY_CACHE_TTL = 15 * 60 * 1000;

function getNearbyCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    return Date.now() - ts < NEARBY_CACHE_TTL ? data : null;
  } catch {
    return null;
  }
}

function setNearbyCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ── Nearby categories ────────────────────────────────────────────────────────

const NEARBY_CATEGORIES = [
  { key: "mosques", emoji: "🕌", title: "Nearby Mosques" },
  { key: "hospitals", emoji: "🏥", title: "Hospitals & Clinics" },
  { key: "pharmacy", emoji: "💊", title: "Pharmacies" },
  { key: "police", emoji: "👮", title: "Police Stations" },
  { key: "halal", emoji: "🍽️", title: "Halal Restaurants" },
  { key: "atms", emoji: "🏧", title: "ATMs & Banks" },
  { key: "fuel", emoji: "⛽", title: "Petrol Stations" },
  { key: "ngos", emoji: "🤝", title: "NGOs & Charities" },
  { key: "parking", emoji: "🅿️", title: "Parking" },
];

// ── Emergency contacts by country code ────────────────────────────────────

const EMERGENCY_CONTACTS = {
  PK: {
    police: "15",
    ambulance: "1122",
    fire: "16",
    tourist: "1422",
    name: "Pakistan",
  },
  US: {
    police: "911",
    ambulance: "911",
    fire: "911",
    tourist: "1-800-877-8339",
    name: "United States",
  },
  GB: {
    police: "999",
    ambulance: "999",
    fire: "999",
    tourist: "0800-111-6000",
    name: "United Kingdom",
  },
  AE: {
    police: "999",
    ambulance: "998",
    fire: "997",
    tourist: "800-2255",
    name: "UAE",
  },
  TR: {
    police: "155",
    ambulance: "112",
    fire: "110",
    tourist: "170",
    name: "Turkey",
  },
  IN: {
    police: "100",
    ambulance: "102",
    fire: "101",
    tourist: "1363",
    name: "India",
  },
  SA: {
    police: "999",
    ambulance: "997",
    fire: "998",
    tourist: "930",
    name: "Saudi Arabia",
  },
  MY: {
    police: "999",
    ambulance: "999",
    fire: "994",
    tourist: "03-8891-8000",
    name: "Malaysia",
  },
  TH: {
    police: "191",
    ambulance: "1669",
    fire: "199",
    tourist: "1155",
    name: "Thailand",
  },
  JP: {
    police: "110",
    ambulance: "119",
    fire: "119",
    tourist: "03-3501-3224",
    name: "Japan",
  },
  FR: {
    police: "17",
    ambulance: "15",
    fire: "18",
    tourist: "3237",
    name: "France",
  },
  DE: {
    police: "110",
    ambulance: "112",
    fire: "112",
    tourist: "030-250025",
    name: "Germany",
  },
  IT: {
    police: "113",
    ambulance: "118",
    fire: "115",
    tourist: "06-4686",
    name: "Italy",
  },
  ES: {
    police: "091",
    ambulance: "061",
    fire: "080",
    tourist: "902-102-112",
    name: "Spain",
  },
  EG: {
    police: "122",
    ambulance: "123",
    fire: "180",
    tourist: "126",
    name: "Egypt",
  },
  ID: {
    police: "110",
    ambulance: "118",
    fire: "113",
    tourist: "021-526-0196",
    name: "Indonesia",
  },
  DEFAULT: {
    police: "112",
    ambulance: "112",
    fire: "112",
    tourist: "—",
    name: "International",
  },
  // More countries
  QA: {
    police: "999",
    ambulance: "999",
    fire: "999",
    tourist: "—",
    name: "Qatar",
  },
  BD: {
    police: "999",
    ambulance: "199",
    fire: "199",
    tourist: "—",
    name: "Bangladesh",
  },
  LK: {
    police: "119",
    ambulance: "110",
    fire: "110",
    tourist: "1912",
    name: "Sri Lanka",
  },
  NP: {
    police: "100",
    ambulance: "102",
    fire: "101",
    tourist: "1144",
    name: "Nepal",
  },
  CN: {
    police: "110",
    ambulance: "120",
    fire: "119",
    tourist: "12301",
    name: "China",
  },
  KR: {
    police: "112",
    ambulance: "119",
    fire: "119",
    tourist: "1330",
    name: "South Korea",
  },
  AU: {
    police: "000",
    ambulance: "000",
    fire: "000",
    tourist: "1300-555-135",
    name: "Australia",
  },
  CA: {
    police: "911",
    ambulance: "911",
    fire: "911",
    tourist: "—",
    name: "Canada",
  },
  SG: {
    police: "999",
    ambulance: "995",
    fire: "995",
    tourist: "1800-736-2000",
    name: "Singapore",
  },
  GR: {
    police: "100",
    ambulance: "166",
    fire: "199",
    tourist: "171",
    name: "Greece",
  },
  PT: {
    police: "112",
    ambulance: "112",
    fire: "112",
    tourist: "808-781-212",
    name: "Portugal",
  },
  NL: {
    police: "112",
    ambulance: "112",
    fire: "112",
    tourist: "0900-400-4040",
    name: "Netherlands",
  },
  MA: {
    police: "19",
    ambulance: "15",
    fire: "15",
    tourist: "—",
    name: "Morocco",
  },
  JO: {
    police: "911",
    ambulance: "911",
    fire: "911",
    tourist: "—",
    name: "Jordan",
  },
  OM: {
    police: "9999",
    ambulance: "9999",
    fire: "9999",
    tourist: "—",
    name: "Oman",
  },
  KW: {
    police: "112",
    ambulance: "112",
    fire: "112",
    tourist: "—",
    name: "Kuwait",
  },
  BH: {
    police: "999",
    ambulance: "999",
    fire: "999",
    tourist: "—",
    name: "Bahrain",
  },
  MV: {
    police: "119",
    ambulance: "102",
    fire: "118",
    tourist: "—",
    name: "Maldives",
  },
  KE: {
    police: "999",
    ambulance: "999",
    fire: "999",
    tourist: "—",
    name: "Kenya",
  },
  ZA: {
    police: "10111",
    ambulance: "10177",
    fire: "10177",
    tourist: "083-123-6789",
    name: "South Africa",
  },
  BR: {
    police: "190",
    ambulance: "192",
    fire: "193",
    tourist: "—",
    name: "Brazil",
  },
  MX: {
    police: "911",
    ambulance: "911",
    fire: "911",
    tourist: "078",
    name: "Mexico",
  },
};

// ── Styles ───────────────────────────────────────────────────────────────────

const cardShadow = "0 2px 12px rgba(0,0,0,0.06)";

const styles = {
  container: {
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    padding: "32px 16px",
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  h1: { fontSize: 28, fontWeight: 700, color: "#0A0A0A", margin: 0 },
  subtitle: { color: "#6B7280", margin: "4px 0 0" },
  btnGroup: { display: "flex", gap: 10 },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    border: "none",
    borderRadius: 8,
    background: "#FF4500",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: cardShadow,
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 700, color: "#0A0A0A", margin: 0 },
  statSub: { fontSize: 13, color: "#6B7280", margin: "4px 0 0" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0A0A0A",
    margin: "0 0 20px",
  },
  nearbyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },
  nearbyCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: cardShadow,
  },
  nearbyHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  nearbyEmoji: { fontSize: 24 },
  nearbyTitle: { fontSize: 16, fontWeight: 600, color: "#0A0A0A", margin: 0 },
  nearbyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #F3F4F6",
  },
  nearbyName: { fontSize: 14, color: "#374151", fontWeight: 500 },
  nearbyDist: { fontSize: 12, color: "#9CA3AF" },
  mapLink: {
    fontSize: 12,
    color: "#FF4500",
    textDecoration: "none",
    marginLeft: 8,
    whiteSpace: "nowrap",
  },
  skeleton: {
    height: 14,
    borderRadius: 6,
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    marginBottom: 10,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 32,
  },
  tripCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: cardShadow,
    marginBottom: 12,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#0A0A0A",
    margin: "0 0 4px",
  },
  tripDest: {
    fontSize: 14,
    color: "#6B7280",
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  badge: (bg, color) => ({
    display: "inline-block",
    padding: "2px 10px",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 999,
    background: bg,
    color,
    marginRight: 6,
  }),
  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 14,
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    cursor: "pointer",
    marginBottom: 10,
    textAlign: "left",
    transition: "border-color 0.15s",
  },
  qaIcon: (bg) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: bg,
    flexShrink: 0,
  }),
  qaTitle: { fontSize: 14, fontWeight: 600, color: "#0A0A0A", margin: 0 },
  qaSub: { fontSize: 13, color: "#6B7280", margin: 0 },
  emptyTrips: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#fff",
    borderRadius: 12,
    boxShadow: cardShadow,
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live data hooks
  const loc = useLocation();
  const weather = useWeather({ lat: loc.lat, lng: loc.lng, city: loc.city });

  // Live clock — aligned with IP-detected timezone
  const [currentTime, setCurrentTime] = useState("");
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    // Use IP-detected timezone, fallback to browser timezone
    const tz =
      loc.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setTimeZone(tz);
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: tz,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [loc.timezone]);

  // Nearby places
  const [nearby, setNearby] = useState({});
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [isMuslimCountry, setIsMuslimCountry] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!loc.lat || !loc.lng || fetchedRef.current) return;
    fetchedRef.current = true;

    const cacheKey = `nearby_${loc.lat.toFixed(2)}_${loc.lng.toFixed(2)}`;
    const cached = getNearbyCache(cacheKey);
    // Only use cache if at least 3 categories have data (not a partial/failed result)
    if (cached) {
      const filledCount = Object.values(cached).filter(
        (arr) => Array.isArray(arr) && arr.length > 0,
      ).length;
      if (filledCount >= 3) {
        setNearby(cached);
        setNearbyLoading(false);
        return;
      }
      // Partial cache — clear it and refetch
      try {
        localStorage.removeItem(cacheKey);
      } catch {}
    }

    setNearbyLoading(true);

    const fetchAll = async () => {
      const result = await fetchAllNearbyFromBackend(
        loc.lat,
        loc.lng,
        loc.countryCode,
      );
      if (result) {
        const data = result.categories;
        // Only cache if at least 3 categories have results
        const filledCount = Object.values(data).filter(
          (arr) => Array.isArray(arr) && arr.length > 0,
        ).length;
        setNearby(data);
        setIsMuslimCountry(result.isMuslimCountry);
        if (filledCount >= 3) setNearbyCache(cacheKey, data);
      } else {
        const empty = {};
        NEARBY_CATEGORIES.forEach((cat) => {
          empty[cat.key] = [];
        });
        setNearby(empty);
      }
      setNearbyLoading(false);
    };

    fetchAll();
  }, [loc.lat, loc.lng]);

  // Auth check + trips fetch
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    tripsAPI
      .getAll()
      .then(({ data }) => setTrips(data.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // ── Auth wall ──────────────────────────────────────────────────────────────

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

  const recentTrips = trips.slice(0, 3);
  const currSymbol = getCurrencySymbol(loc.currency);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      {/* Shimmer keyframes */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>Welcome back, {user?.name}! 👋</h1>
          <p style={styles.subtitle}>
            Here&apos;s what&apos;s happening with your travels
          </p>
        </div>
        <div style={styles.btnGroup}>
          <button
            style={styles.btnOutline}
            onClick={() => router.push("/settings")}
          >
            <Settings size={16} /> Settings
          </button>
          <button
            style={styles.btnPrimary}
            onClick={() => router.push("/chat")}
          >
            <Plus size={16} /> Plan New Trip
          </button>
        </div>
      </div>

      {/* ── Live Stats ──────────────────────────────────────────────────── */}
      <div style={styles.statsGrid}>
        {/* Location */}
        <div style={styles.statCard}>
          <div style={styles.statEmoji}>📍</div>
          <p style={styles.statValue}>
            {loc.loading ? "Detecting…" : `${loc.city}, ${loc.country}`}
          </p>
          <p style={styles.statSub}>
            {loc.lat && loc.lng
              ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
              : "Locating…"}
          </p>
        </div>

        {/* Time */}
        <div style={styles.statCard}>
          <div style={styles.statEmoji}>🕐</div>
          <p style={styles.statValue}>{currentTime || "--:--:--"}</p>
          <p style={styles.statSub}>{timeZone}</p>
        </div>

        {/* Weather */}
        <div style={styles.statCard}>
          <div style={styles.statEmoji}>{weather.icon || "🌡️"}</div>
          <p style={styles.statValue}>
            {weather.loading
              ? "Loading…"
              : weather.temp !== null
                ? `${weather.temp}°C — ${weather.condition}`
                : "Unavailable"}
          </p>
          <p style={styles.statSub}>
            {weather.feelsLike !== null
              ? `Feels like ${weather.feelsLike}°C`
              : ""}
          </p>
        </div>

        {/* Currency */}
        <div style={styles.statCard}>
          <div style={styles.statEmoji}>💱</div>
          <p style={styles.statValue}>
            {loc.loading ? "Detecting…" : `${currSymbol} ${loc.currency}`}
          </p>
          <p style={styles.statSub}>Auto-detected from IP</p>
        </div>
      </div>

      {/* ── Near You Right Now ──────────────────────────────────────────── */}
      <h2 style={styles.sectionTitle}>📍 Near You Right Now</h2>
      <div style={styles.nearbyGrid}>
        {NEARBY_CATEGORIES.map((cat) => {
          const items = nearby[cat.key];
          const isLoading = nearbyLoading || !items;

          return (
            <div key={cat.key} style={styles.nearbyCard}>
              <div style={styles.nearbyHeader}>
                <span style={styles.nearbyEmoji}>{cat.emoji}</span>
                <h3 style={styles.nearbyTitle}>{cat.title}</h3>
              </div>

              {isLoading ? (
                <>
                  <div style={{ ...styles.skeleton, width: "80%" }} />
                  <div style={{ ...styles.skeleton, width: "60%" }} />
                  <div style={{ ...styles.skeleton, width: "70%" }} />
                </>
              ) : items.length === 0 ? (
                <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
                  None found nearby
                </p>
              ) : (
                <>
                  {cat.key === "halal" &&
                    items.length > 0 &&
                    isMuslimCountry && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#10B981",
                          margin: "0 0 8px",
                          fontWeight: 500,
                        }}
                      >
                        ✅ All restaurants in this region are halal by default.
                      </p>
                    )}
                  {cat.key === "halal" &&
                    items.length > 0 &&
                    !isMuslimCountry &&
                    !items.some(
                      (p) =>
                        p.cuisine &&
                        /halal|pakistani|arabic|turkish|indian|muslim/i.test(
                          p.cuisine,
                        ),
                    ) && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#F59E0B",
                          margin: "0 0 8px",
                          fontWeight: 500,
                        }}
                      >
                        ⚠️ No verified halal restaurants found — showing nearby
                        restaurants. Verify halal status locally.
                      </p>
                    )}
                  {items.map((place, i) => (
                    <div key={i} style={styles.nearbyItem}>
                      <div>
                        <span style={styles.nearbyName}>{place.name}</span>
                        <span style={styles.nearbyDist}>
                          {" · "}
                          {place.distanceText || ""}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(place.name)}+${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.mapLink}
                      >
                        View on Map ↗
                      </a>
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Emergency Contacts ── */}
      {EMERGENCY_CONTACTS[loc.countryCode] && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={styles.sectionTitle}>
            🚨 Emergency Contacts — {EMERGENCY_CONTACTS[loc.countryCode].name}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {(() => {
              const contacts = EMERGENCY_CONTACTS[loc.countryCode];
              return [
                {
                  emoji: "🚔",
                  label: "Police",
                  number: contacts.police,
                  color: "#3B82F6",
                },
                {
                  emoji: "🚑",
                  label: "Ambulance",
                  number: contacts.ambulance,
                  color: "#EF4444",
                },
                {
                  emoji: "🚒",
                  label: "Fire",
                  number: contacts.fire,
                  color: "#F59E0B",
                },
                ...(contacts.tourist && contacts.tourist !== "—"
                  ? [
                      {
                        emoji: "ℹ️",
                        label: "Tourist Helpline",
                        number: contacts.tourist,
                        color: "#10B981",
                      },
                    ]
                  : []),
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "18px 20px",
                    boxShadow: cardShadow,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${item.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {item.emoji}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </p>
                    <a
                      href={`tel:${item.number}`}
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: item.color,
                        textDecoration: "none",
                        display: "block",
                        marginTop: 2,
                      }}
                    >
                      {item.number}
                    </a>
                  </div>
                </div>
              ));
            })()}
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
            📍 Based on your detected location: {loc.city},{" "}
            {EMERGENCY_CONTACTS[loc.countryCode].name}
          </p>
        </div>
      )}

      {/* ── Main content: Recent Trips + Quick Actions ──────────────────── */}
      <div style={styles.mainGrid} data-dashboard-main="">
        {/* Recent Trips */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Recent Trips</h2>
            <button
              style={{
                ...styles.btnOutline,
                border: "none",
                color: "#FF4500",
                background: "transparent",
              }}
              onClick={() => router.push("/trips")}
            >
              View All
            </button>
          </div>

          {loading ? (
            <p style={{ color: "#9CA3AF", textAlign: "center", padding: 32 }}>
              Loading trips…
            </p>
          ) : recentTrips.length === 0 ? (
            <div style={styles.emptyTrips}>
              <MapPin
                size={48}
                color="#D1D5DB"
                style={{ margin: "0 auto 12px" }}
              />
              <p style={{ color: "#6B7280", marginBottom: 16 }}>
                No trips yet. Start planning your first adventure!
              </p>
              <button
                style={styles.btnPrimary}
                onClick={() => router.push("/chat")}
              >
                <Plus size={16} /> Plan a Trip with AI
              </button>
            </div>
          ) : (
            recentTrips.map((trip) => (
              <div key={trip._id} style={styles.tripCard}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3 style={styles.tripTitle}>{trip.title}</h3>
                    <div style={styles.tripDest}>
                      <MapPin size={14} /> {trip.destination}
                    </div>
                    <div>
                      <span
                        style={styles.badge(
                          trip.status === "active"
                            ? "#E8F5E9"
                            : trip.status === "planned"
                              ? "#FFF5F0"
                              : "#F5F5F5",
                          trip.status === "active"
                            ? "#22C55E"
                            : trip.status === "planned"
                              ? "#FF4500"
                              : "#374151",
                        )}
                      >
                        {trip.status}
                      </span>
                      {trip.aiGenerated && (
                        <span style={styles.badge("#FFF3E0", "#F59E0B")}>
                          AI Generated
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    style={styles.btnOutline}
                    onClick={() => router.push(`/trips/${trip._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 16 }}>
            Quick Actions
          </h2>

          <button
            style={styles.quickAction}
            onClick={() => router.push("/chat")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#FF4500")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#E5E7EB")
            }
          >
            <div style={styles.qaIcon("#FFF5F0")}>
              <MessageSquare size={20} color="#FF4500" />
            </div>
            <div>
              <p style={styles.qaTitle}>Start AI Chat</p>
              <p style={styles.qaSub}>Plan your next adventure</p>
            </div>
          </button>

          <button
            style={styles.quickAction}
            onClick={() => router.push("/destinations")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#0284C7")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#E5E7EB")
            }
          >
            <div style={styles.qaIcon("#E0F2FE")}>
              <Globe size={20} color="#0284C7" />
            </div>
            <div>
              <p style={styles.qaTitle}>Explore Destinations</p>
              <p style={styles.qaSub}>Discover new places</p>
            </div>
          </button>

          <button
            style={styles.quickAction}
            onClick={() => router.push("/trips")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#F59E0B")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#E5E7EB")
            }
          >
            <div style={styles.qaIcon("#FFF3E0")}>
              <Calendar size={20} color="#F59E0B" />
            </div>
            <div>
              <p style={styles.qaTitle}>My Trips</p>
              <p style={styles.qaSub}>View all itineraries</p>
            </div>
          </button>

          <button
            style={styles.quickAction}
            onClick={() => router.push("/settings")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#D1D5DB")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#E5E7EB")
            }
          >
            <div style={styles.qaIcon("#F5F5F5")}>
              <Settings size={20} color="#6B7280" />
            </div>
            <div>
              <p style={styles.qaTitle}>Settings</p>
              <p style={styles.qaSub}>Manage your account</p>
            </div>
          </button>

          {/* Travel Tip */}
          <div
            style={{
              marginTop: 28,
              padding: 20,
              background: "linear-gradient(135deg, #FFF5F0, #FFF9F5)",
              borderRadius: 16,
              border: "1px solid #FFE0CC",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TrendingUp size={20} color="#FF4500" />
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: 600,
                    color: "#0A0A0A",
                    margin: "0 0 6px",
                    fontSize: 15,
                  }}
                >
                  Travel Tip
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Book flights 6-8 weeks in advance for the best deals! Our AI
                  can help you find the perfect timing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          /* stack main grid on tablet/mobile */
        }
        @media (max-width: 768px) {
          [data-dashboard-main] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
