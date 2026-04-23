"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { externalAPI } from "@/lib/api";
import { usePreferenceStore, CURRENCY_SYMBOLS } from "@/store/preferenceStore";
import { useDestinationStore } from "@/store/destinationStore";
import {
  Search,
  MapPin,
  Cloud,
  Utensils,
  Landmark,
  Loader2,
  ArrowRight,
  Plane,
  Clock,
  Globe,
  Sun,
  ExternalLink,
  Star,
} from "lucide-react";

async function fetchWithRetry(fn, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data, ttl = 30 * 60 * 1000) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ data, expiry: Date.now() + ttl }),
    );
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

const DESTINATIONS = [
  {
    name: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    tagline: "Where tradition meets innovation",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    tags: ["Culture", "Food", "Tech"],
  },
  {
    name: "Istanbul",
    country: "Turkey",
    flag: "🇹🇷",
    tagline: "Where East meets West",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    tags: ["History", "Halal", "Bazaars"],
  },
  {
    name: "Paris",
    country: "France",
    flag: "🇫🇷",
    tagline: "The City of Light and Love",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    tags: ["Art", "Romance", "Cuisine"],
  },
  {
    name: "Dubai",
    country: "UAE",
    flag: "🇦🇪",
    tagline: "Futuristic luxury in the desert",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    tags: ["Luxury", "Shopping", "Halal"],
  },
  {
    name: "Bali",
    country: "Indonesia",
    flag: "🇮🇩",
    tagline: "Tropical paradise awaits",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    tags: ["Nature", "Wellness", "Beach"],
  },
  {
    name: "London",
    country: "UK",
    flag: "🇬🇧",
    tagline: "Royal heritage and modern vibes",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    tags: ["History", "Culture", "Food"],
  },
  {
    name: "New York",
    country: "USA",
    flag: "🇺🇸",
    tagline: "The city that never sleeps",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    tags: ["Nightlife", "Food", "Art"],
  },
  {
    name: "Bangkok",
    country: "Thailand",
    flag: "🇹🇭",
    tagline: "Street food capital of the world",
    img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    tags: ["Food", "Temples", "Budget"],
  },
  {
    name: "Rome",
    country: "Italy",
    flag: "🇮🇹",
    tagline: "Walk through ancient history",
    img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    tags: ["History", "Food", "Art"],
  },
  {
    name: "Barcelona",
    country: "Spain",
    flag: "🇪🇸",
    tagline: "Gaudí, beaches, and tapas",
    img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    tags: ["Architecture", "Beach", "Nightlife"],
  },
  {
    name: "Maldives",
    country: "Maldives",
    flag: "🇲🇻",
    tagline: "Crystal clear waters and overwater villas",
    img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    tags: ["Beach", "Luxury", "Halal"],
  },
  {
    name: "Marrakech",
    country: "Morocco",
    flag: "🇲🇦",
    tagline: "Colors, spices, and souks",
    img: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80",
    tags: ["Culture", "Halal", "Adventure"],
  },
];

export default function DestinationsPage() {
  const router = useRouter();
  const { destinationCurrency, tempUnit } = usePreferenceStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [unescoSites, setUnescoSites] = useState([]);

  useEffect(() => {
    return () => {
      useDestinationStore.getState().clearDestination();
    };
  }, []);

  const searchDestination = async (name) => {
    setLoading(true);
    setResult(null);
    setWeather(null);
    setRestaurants([]);
    setAttractions([]);
    setUnescoSites([]);

    const cityKey = name.toLowerCase().replace(/\s+/g, "_");

    // Check caches and show cached data immediately
    const cachedWeather = getCached(`dest_weather_${cityKey}`);
    const cachedRestaurants = getCached(`dest_restaurants_${cityKey}`);
    const cachedAttractions = getCached(`dest_attractions_${cityKey}`);
    const cachedUnesco = getCached(`dest_unesco_${cityKey}`);
    if (cachedWeather) setWeather(cachedWeather);
    if (cachedRestaurants) setRestaurants(cachedRestaurants);
    if (cachedAttractions) setAttractions(cachedAttractions);
    if (cachedUnesco) setUnescoSites(cachedUnesco);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const geo = await externalAPI.geocode(name, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!geo.data.data) {
        setLoading(false);
        return;
      }
      const loc = geo.data.data;
      setResult(loc);
      useDestinationStore.getState().setDestination({
        city: loc.displayName?.split(",")[0],
        country: loc.country || null,
        currency: loc.currency || null,
      });
      // Fetch weather first (uses OpenWeather, not Overpass), then Overpass calls sequentially
      try {
        const wx = await externalAPI.weather(loc.lat, loc.lng);
        if (wx.data.data) {
          setWeather(wx.data.data);
          setCache(`dest_weather_${cityKey}`, wx.data.data);
        }
      } catch {}

      // Attractions (Overpass call 1)
      try {
        const attr = await externalAPI.attractions(loc.lat, loc.lng);
        const attractionData = attr.data.data?.slice(0, 8) || [];
        setAttractions(attractionData);
        setCache(`dest_attractions_${cityKey}`, attractionData);
      } catch {}

      // Small delay to avoid Overpass 429
      await new Promise((r) => setTimeout(r, 1500));

      // UNESCO World Heritage Sites (Overpass call 2)
      try {
        const unescoRes = await externalAPI.unesco(loc.lat, loc.lng, 200);
        const unescoData = unescoRes.data.data?.slice(0, 8) || [];
        setUnescoSites(unescoData);
        setCache(`dest_unesco_${cityKey}`, unescoData);
      } catch {}

      // Small delay to avoid Overpass 429
      await new Promise((r) => setTimeout(r, 1500));

      // Restaurants (Overpass call 3)
      try {
        const rest = await externalAPI.places(
          name + " halal",
          loc.lat,
          loc.lng,
          "restaurant",
        );
        const rawData = rest.data.data?.slice(0, 8) || [];
        // Sort halal-tagged restaurants first
        const restaurantData = [...rawData].sort((a, b) => {
          const aHalal = a.dietary?.halal ? 1 : 0;
          const bHalal = b.dietary?.halal ? 1 : 0;
          return bHalal - aHalal;
        });
        setRestaurants(restaurantData);
        setCache(`dest_restaurants_${cityKey}`, restaurantData);
      } catch {}
    } catch {
      // Abort/timeout or network error
    } finally {
      clearTimeout(timeout);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "var(--orange-bg)",
            borderRadius: 50,
            marginBottom: 16,
          }}
        >
          <Plane size={16} style={{ color: "var(--orange)" }} />
          <span
            style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)" }}
          >
            Explore the World
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            color: "#0A0A0A",
            marginBottom: 12,
          }}
        >
          Discover Your Next{" "}
          <span style={{ color: "var(--orange)" }}>Destination</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "#6B7280",
            maxWidth: 520,
            margin: "0 auto 32px",
          }}
        >
          Search any city or explore our curated picks — with real-time weather,
          restaurants, and attractions
        </p>

        {/* Search */}
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
          <Search
            size={20}
            style={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              query.trim() &&
              searchDestination(query.trim())
            }
            placeholder="Search any city... Tokyo, Istanbul, Paris..."
            className="input-field"
            style={{
              paddingLeft: 48,
              paddingRight: 120,
              height: 56,
              fontSize: 16,
              borderRadius: 50,
            }}
          />
          <button
            onClick={() => query.trim() && searchDestination(query.trim())}
            disabled={loading}
            className="btn-orange"
            style={{
              position: "absolute",
              right: 6,
              top: 6,
              bottom: 6,
              padding: "0 24px",
              fontSize: 14,
              borderRadius: 50,
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2
            size={40}
            style={{
              color: "var(--orange)",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#6B7280", fontSize: 16 }}>
            Searching destinations...
          </p>
        </div>
      )}

      {/* Search Results */}
      {result &&
        !loading &&
        (() => {
          const cityName = result.displayName?.split(",")[0] || query;
          const CITY_IMAGES = {
            tokyo:
              "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&fit=crop",
            istanbul:
              "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80&fit=crop",
            paris:
              "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&fit=crop",
            dubai:
              "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80&fit=crop",
            bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80&fit=crop",
            london:
              "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80&fit=crop",
            "new york":
              "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80&fit=crop",
            bangkok:
              "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80&fit=crop",
            rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80&fit=crop",
            barcelona:
              "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80&fit=crop",
            maldives:
              "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80&fit=crop",
            marrakech:
              "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=80&fit=crop",
            singapore:
              "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80&fit=crop",
            sydney:
              "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80&fit=crop",
            karachi:
              "https://images.unsplash.com/photo-1572688824905-5b0e8c13e8d0?w=1200&q=80&fit=crop",
            lahore:
              "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80&fit=crop",
          };
          const heroImg =
            CITY_IMAGES[cityName.toLowerCase()] ||
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&fit=crop";
          return (
            <div style={{ marginBottom: 60 }}>
              {/* Hero Banner */}
              <div
                style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  marginBottom: 28,
                  height: 320,
                  background: `url(${heroImg}) center/cover no-repeat`,
                  backgroundColor: "#1a1a2e",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(transparent 30%, rgba(0,0,0,0.75))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 32,
                    left: 32,
                    right: 32,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 40,
                        fontWeight: 800,
                        color: "#FFFFFF",
                        margin: 0,
                        textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {cityName}
                    </h2>
                    <p
                      style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.85)",
                        margin: "6px 0 0",
                      }}
                    >
                      <MapPin
                        size={14}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: 4,
                        }}
                      />
                      {result.displayName}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/chat?destination=${encodeURIComponent(cityName)}`,
                      )
                    }
                    className="btn-orange"
                    style={{
                      padding: "14px 32px",
                      fontSize: 15,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 50,
                      boxShadow: "0 4px 16px rgba(255,69,0,0.4)",
                    }}
                  >
                    <Plane size={18} /> Plan a Trip Here
                  </button>
                </div>
              </div>

              {/* Quick Stats Row */}
              {weather && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                    marginBottom: 32,
                  }}
                >
                  <div
                    className="card"
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "var(--orange-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Cloud size={22} style={{ color: "var(--orange)" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
                        Current Weather
                      </p>
                      <p
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#0A0A0A",
                          margin: "2px 0 0",
                        }}
                      >
                        {tempUnit === "F"
                          ? Math.round((weather.temp * 9) / 5 + 32)
                          : Math.round(weather.temp)}
                        °{tempUnit}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          margin: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        {weather.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#EEF2FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Globe size={22} style={{ color: "#4F46E5" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
                        Details
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0A0A0A",
                          margin: "2px 0 0",
                        }}
                      >
                        💧 {weather.humidity}% humidity
                      </p>
                      <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
                        💨 Wind {weather.windSpeed} m/s
                      </p>
                    </div>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#FEF3C7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Sun size={22} style={{ color: "#D97706" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
                        Feels Like
                      </p>
                      <p
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#0A0A0A",
                          margin: "2px 0 0",
                        }}
                      >
                        {tempUnit === "F"
                          ? Math.round((weather.feelsLike * 9) / 5 + 32)
                          : Math.round(weather.feelsLike)}
                        °{tempUnit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Restaurants Section */}
              <div style={{ marginBottom: 36 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
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
                    }}
                  >
                    <Utensils size={18} style={{ color: "var(--orange)" }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Restaurants in {cityName}
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#9CA3AF",
                      background: "#F5F5F5",
                      padding: "3px 10px",
                      borderRadius: 99,
                    }}
                  >
                    {restaurants.length} found
                  </span>
                </div>
                {restaurants.length > 0 &&
                  !restaurants.some((r) => r.dietary?.halal) && (
                    <div
                      style={{
                        background: "#FEF3C7",
                        border: "1px solid #F59E0B",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 16,
                        fontSize: 14,
                        color: "#92400E",
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      ⚠️ No verified halal restaurants found — showing nearby
                      restaurants. Verify halal status locally.
                    </div>
                  )}
                {restaurants.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {restaurants.map((r, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{
                          padding: 20,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          transition: "transform 0.2s, box-shadow 0.2s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#0A0A0A",
                                margin: 0,
                              }}
                            >
                              {r.name}
                            </p>
                            {r.cuisine && (
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "var(--orange)",
                                  background: "var(--orange-bg)",
                                  padding: "3px 10px",
                                  borderRadius: 99,
                                  marginTop: 6,
                                }}
                              >
                                {r.cuisine}
                              </span>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", gap: 4, flexShrink: 0 }}
                          >
                            {r.dietary?.halal && (
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "4px 10px",
                                  borderRadius: 99,
                                  background: "#E8F5E9",
                                  color: "#2E7D32",
                                  fontWeight: 700,
                                }}
                              >
                                🟢 Halal
                              </span>
                            )}
                            {r.dietary?.vegan && (
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "4px 10px",
                                  borderRadius: 99,
                                  background: "#E3F2FD",
                                  color: "#1565C0",
                                  fontWeight: 700,
                                }}
                              >
                                🌱 Vegan
                              </span>
                            )}
                          </div>
                        </div>
                        {r.address && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#9CA3AF",
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            <MapPin
                              size={11}
                              style={{
                                display: "inline",
                                verticalAlign: "middle",
                                marginRight: 3,
                              }}
                            />
                            {r.address}
                          </p>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(r.name + " " + cityName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--orange)",
                            textDecoration: "none",
                            marginTop: "auto",
                          }}
                        >
                          <ExternalLink size={13} /> View on Google Maps
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{ padding: 32, textAlign: "center" }}
                  >
                    <Utensils
                      size={28}
                      style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
                    />
                    <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
                      No restaurants found for this destination
                    </p>
                  </div>
                )}
              </div>

              {/* Attractions Section */}
              <div style={{ marginBottom: 36 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Landmark size={18} style={{ color: "#4F46E5" }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Top Attractions
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#9CA3AF",
                      background: "#F5F5F5",
                      padding: "3px 10px",
                      borderRadius: 99,
                    }}
                  >
                    {attractions.length} found
                  </span>
                </div>
                {attractions.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {attractions.map((a, i) => {
                      const typeColors = {
                        museum: { bg: "#EDE9FE", color: "#7C3AED" },
                        park: { bg: "#DCFCE7", color: "#16A34A" },
                        temple: { bg: "#FEF3C7", color: "#D97706" },
                        church: { bg: "#FEF3C7", color: "#D97706" },
                        mosque: { bg: "#D1FAE5", color: "#059669" },
                        monument: { bg: "#FFE4E6", color: "#E11D48" },
                        castle: { bg: "#F3E8FF", color: "#9333EA" },
                        default: { bg: "#F0F9FF", color: "#0284C7" },
                      };
                      const typeKey = (a.type || "").toLowerCase();
                      const badge = typeColors[typeKey] || typeColors.default;
                      return (
                        <div
                          key={i}
                          className="card"
                          style={{
                            padding: 20,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            transition: "transform 0.2s, box-shadow 0.2s",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 24px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#0A0A0A",
                                margin: 0,
                                flex: 1,
                              }}
                            >
                              {a.name}
                            </p>
                            {a.type && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "4px 10px",
                                  borderRadius: 99,
                                  background: badge.bg,
                                  color: badge.color,
                                  textTransform: "capitalize",
                                  flexShrink: 0,
                                }}
                              >
                                {a.type}
                              </span>
                            )}
                          </div>
                          {a.description && (
                            <p
                              style={{
                                fontSize: 13,
                                color: "#6B7280",
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {a.description.length > 120
                                ? a.description.slice(0, 120) + "..."
                                : a.description}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              marginTop: "auto",
                            }}
                          >
                            <a
                              href={`https://www.google.com/maps/search/${encodeURIComponent(a.name + " " + cityName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--orange)",
                                textDecoration: "none",
                              }}
                            >
                              <ExternalLink size={13} /> Maps
                            </a>
                            {a.wikipedia && (
                              <a
                                href={a.wikipedia}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#4F46E5",
                                  textDecoration: "none",
                                }}
                              >
                                <Globe size={13} /> Wikipedia
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{ padding: 32, textAlign: "center" }}
                  >
                    <Landmark
                      size={28}
                      style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
                    />
                    <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
                      No attractions found for this destination
                    </p>
                  </div>
                )}
              </div>

              {/* UNESCO World Heritage Sites Section */}
              <div style={{ marginBottom: 36 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#FEF3C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🏛️</span>
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    UNESCO World Heritage Sites
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#9CA3AF",
                      background: "#F5F5F5",
                      padding: "3px 10px",
                      borderRadius: 99,
                    }}
                  >
                    {unescoSites.length} found
                  </span>
                </div>
                {unescoSites.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {unescoSites.map((site, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{
                          padding: 20,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          borderLeft: "4px solid #D97706",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#0A0A0A",
                              margin: 0,
                              flex: 1,
                            }}
                          >
                            {site.name}
                          </p>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 99,
                              background: "#FEF3C7",
                              color: "#D97706",
                              flexShrink: 0,
                            }}
                          >
                            UNESCO
                          </span>
                        </div>
                        {site.inscriptionDate && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#D97706",
                              margin: 0,
                              fontWeight: 600,
                            }}
                          >
                            Inscribed: {site.inscriptionDate}
                          </p>
                        )}
                        {site.description && (
                          <p
                            style={{
                              fontSize: 13,
                              color: "#6B7280",
                              margin: 0,
                              lineHeight: 1.5,
                            }}
                          >
                            {site.description.length > 120
                              ? site.description.slice(0, 120) + "..."
                              : site.description}
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            marginTop: "auto",
                          }}
                        >
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(site.name + " " + cityName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--orange)",
                              textDecoration: "none",
                            }}
                          >
                            <ExternalLink size={13} /> Maps
                          </a>
                          {site.unescoId && (
                            <a
                              href={`https://whc.unesco.org/en/list/${site.unescoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#4F46E5",
                                textDecoration: "none",
                              }}
                            >
                              <Globe size={13} /> UNESCO Page
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{ padding: 32, textAlign: "center" }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      🏛️
                    </span>
                    <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
                      No UNESCO World Heritage Sites found near {cityName}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom CTA */}
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 24px",
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #FF8C00 100%)",
                  borderRadius: 20,
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  Ready to explore {cityName}?
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.85)",
                    marginBottom: 24,
                  }}
                >
                  Let our AI build a personalized itinerary just for you
                </p>
                <button
                  onClick={() =>
                    router.push(
                      `/chat?destination=${encodeURIComponent(cityName)}`,
                    )
                  }
                  style={{
                    padding: "16px 40px",
                    fontSize: 16,
                    fontWeight: 700,
                    background: "#FFFFFF",
                    color: "#FF4500",
                    border: "none",
                    borderRadius: 50,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "inherit",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <Plane size={20} /> Plan a Trip to {cityName}
                </button>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setQuery("");
                  useDestinationStore.getState().clearDestination();
                }}
                style={{
                  display: "block",
                  margin: "24px auto 0",
                  color: "var(--orange)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                ← Back to all destinations
              </button>
            </div>
          );
        })()}

      {/* Destination Grid — beautiful cards with images */}
      {!result && !loading && (
        <>
          {/* Featured (first 3 — large cards) */}
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#0A0A0A",
                marginBottom: 20,
              }}
            >
              ✨ Featured Destinations
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {DESTINATIONS.slice(0, 3).map((d) => (
                <div
                  key={d.name}
                  onClick={() => {
                    setQuery(d.name);
                    searchDestination(d.name);
                  }}
                  className="card"
                  style={{
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div style={{ height: 260, position: "relative" }}>
                    <Image
                      src={d.img}
                      alt={d.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="400px"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(transparent 40%, rgba(0,0,0,0.7))",
                      }}
                    />
                    <div style={{ position: "absolute", top: 16, left: 16 }}>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          padding: "5px 14px",
                          borderRadius: 50,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0A0A0A",
                        }}
                      >
                        {d.flag} {d.country}
                      </span>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 16,
                        left: 16,
                        right: 16,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "#FFF",
                          margin: 0,
                        }}
                      >
                        {d.name}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.8)",
                          margin: "4px 0 0",
                        }}
                      >
                        {d.tagline}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      {d.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: "var(--orange-bg)",
                            color: "var(--orange)",
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <ArrowRight size={18} style={{ color: "var(--orange)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All destinations — smaller cards */}
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#0A0A0A",
                marginBottom: 20,
              }}
            >
              🌍 All Destinations
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {DESTINATIONS.slice(3).map((d) => (
                <div
                  key={d.name}
                  onClick={() => {
                    setQuery(d.name);
                    searchDestination(d.name);
                  }}
                  className="card"
                  style={{
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ height: 180, position: "relative" }}>
                    <Image
                      src={d.img}
                      alt={d.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="300px"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(transparent 50%, rgba(0,0,0,0.6))",
                      }}
                    />
                    <div style={{ position: "absolute", top: 12, left: 12 }}>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          padding: "3px 10px",
                          borderRadius: 50,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {d.flag} {d.country}
                      </span>
                    </div>
                    <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#FFF",
                          margin: 0,
                        }}
                      >
                        {d.name}
                      </h3>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px 14px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        lineHeight: 1.5,
                        marginBottom: 10,
                      }}
                    >
                      {d.tagline}
                    </p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {d.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "#F5F5F5",
                            color: "#6B7280",
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              textAlign: "center",
              marginTop: 48,
              padding: "40px 24px",
              background: "var(--orange-bg)",
              borderRadius: 24,
            }}
          >
            <h3
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#0A0A0A",
                marginBottom: 8,
              }}
            >
              Can't find your destination?
            </h3>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 20 }}>
              Search any city in the world — our AI knows them all
            </p>
            <button
              onClick={() => document.querySelector("input")?.focus()}
              className="btn-orange"
              style={{ padding: "14px 32px", fontSize: 15 }}
            >
              Search Now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
