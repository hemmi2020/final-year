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

    const cityKey = name.toLowerCase().replace(/\s+/g, "_");

    // Check caches and show cached data immediately
    const cachedWeather = getCached(`dest_weather_${cityKey}`);
    const cachedRestaurants = getCached(`dest_restaurants_${cityKey}`);
    const cachedAttractions = getCached(`dest_attractions_${cityKey}`);
    if (cachedWeather) setWeather(cachedWeather);
    if (cachedRestaurants) setRestaurants(cachedRestaurants);
    if (cachedAttractions) setAttractions(cachedAttractions);

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
      // Fetch weather, restaurants, attractions in parallel (separate from abort controller)
      const [wx, rest, attr] = await Promise.allSettled([
        fetchWithRetry(() => externalAPI.weather(loc.lat, loc.lng)),
        fetchWithRetry(() =>
          externalAPI.places(name, loc.lat, loc.lng, "restaurant"),
        ),
        fetchWithRetry(() => externalAPI.attractions(loc.lat, loc.lng)),
      ]);
      if (wx.status === "fulfilled") {
        const weatherData = wx.value.data.data;
        setWeather(weatherData);
        setCache(`dest_weather_${cityKey}`, weatherData);
      }
      if (rest.status === "fulfilled") {
        const restaurantData = rest.value.data.data?.slice(0, 8) || [];
        setRestaurants(restaurantData);
        setCache(`dest_restaurants_${cityKey}`, restaurantData);
      }
      if (attr.status === "fulfilled") {
        const attractionData = attr.value.data.data?.slice(0, 8) || [];
        setAttractions(attractionData);
        setCache(`dest_attractions_${cityKey}`, attractionData);
      }
    } catch {
      // Abort/timeout or network error — leave result as null so fallback DESTINATIONS grid renders
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
      {result && !loading && (
        <div style={{ marginBottom: 60 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0A0A0A" }}>
                {result.displayName?.split(",")[0]}
              </h2>
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                {result.displayName}
              </p>
            </div>
            <button
              onClick={() => router.push("/chat")}
              className="btn-orange"
              style={{
                padding: "12px 28px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plane size={16} /> Plan a Trip Here
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {/* Weather */}
            {weather && (
              <div
                className="card"
                style={{ padding: 24, textAlign: "center" }}
              >
                <Cloud
                  size={32}
                  style={{ color: "var(--orange)", margin: "0 auto 12px" }}
                />
                <p style={{ fontSize: 40, fontWeight: 800, color: "#0A0A0A" }}>
                  {tempUnit === "F"
                    ? Math.round((weather.temp * 9) / 5 + 32)
                    : Math.round(weather.temp)}
                  °{tempUnit}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    color: "#6B7280",
                    textTransform: "capitalize",
                  }}
                >
                  {weather.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    marginTop: 8,
                    fontSize: 13,
                    color: "#9CA3AF",
                  }}
                >
                  <span>Feels {Math.round(weather.feelsLike)}°</span>
                  <span>💧 {weather.humidity}%</span>
                  <span>💨 {weather.windSpeed} m/s</span>
                </div>
              </div>
            )}

            {/* Restaurants */}
            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Utensils size={20} style={{ color: "var(--orange)" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Restaurants
                </h3>
              </div>
              {restaurants.length > 0 ? (
                restaurants.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom:
                        i < restaurants.length - 1
                          ? "1px solid #F0F0F0"
                          : "none",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0A0A0A",
                        }}
                      >
                        {r.name}
                      </p>
                      {r.cuisine && (
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                          {r.cuisine}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {r.dietary?.halal && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "#E8F5E9",
                            color: "#2E7D32",
                            fontWeight: 600,
                          }}
                        >
                          Halal
                        </span>
                      )}
                      {r.dietary?.vegan && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "#E3F2FD",
                            color: "#1565C0",
                            fontWeight: 600,
                          }}
                        >
                          Vegan
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                  No restaurants found
                </p>
              )}
            </div>

            {/* Attractions */}
            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Landmark size={20} style={{ color: "var(--orange)" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Attractions
                </h3>
              </div>
              {attractions.length > 0 ? (
                attractions.map((a, i) => (
                  <a
                    key={i}
                    href={`https://www.google.com/maps/search/${encodeURIComponent(a.name + " " + (result.displayName?.split(",")[0] || ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      padding: "10px 0",
                      borderBottom:
                        i < attractions.length - 1
                          ? "1px solid #F0F0F0"
                          : "none",
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#F9FAFB")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0A0A0A",
                      }}
                    >
                      {a.name}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        textTransform: "capitalize",
                      }}
                    >
                      {a.type}
                    </p>
                  </a>
                ))
              ) : (
                <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                  No attractions found
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setQuery("");
              useDestinationStore.getState().clearDestination();
            }}
            style={{
              display: "block",
              margin: "32px auto 0",
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
      )}

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
