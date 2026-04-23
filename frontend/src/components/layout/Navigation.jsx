"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Menu,
  X,
  ChevronDown,
  User,
  MapPin,
  Settings,
  LogOut,
  Plane,
  Globe,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { useLocation, getCurrencySymbol } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Trip Planner" },
  { href: "/chat", label: "AI Chat" },
  { href: "/community", label: "Community" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "About" },
];

const NOTIF_ICONS = { weather: "🌧️", community: "❤️", trip: "✈️", food: "🍽️" };

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getInitialNotifications() {
  return [
    {
      id: "notif-weather-1",
      type: "weather",
      message: "Check weather conditions for your upcoming trips",
      time: Date.now() - 3600000,
      read: false,
    },
    {
      id: "notif-community-1",
      type: "community",
      message: "Welcome to TravelAI! Start planning your first trip",
      time: Date.now() - 7200000,
      read: false,
    },
  ];
}

export default function Navigation() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [flagTooltip, setFlagTooltip] = useState(false);
  const [tempPopover, setTempPopover] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { tempUnit } = require("@/store/preferenceStore").usePreferenceStore();
  const dropRef = useRef(null);

  // Live data hooks — ALWAYS user's home location from IP/GPS, never destination
  const {
    lat,
    lng,
    city,
    country,
    countryCode,
    currency: homeCurrency,
    flag,
    loading: locLoading,
    locationSource,
  } = useLocation();

  // Temperature: ALWAYS user's home city weather, unit from profile preferences
  // Use lat/lng as primary (more reliable), city name as fallback
  const {
    temp,
    feelsLike,
    humidity,
    windSpeed,
    condition,
    city: weatherCity,
    icon: weatherIcon,
    loading: weatherLoading,
  } = useWeather(
    lat && lng
      ? { lat, lng, city: city || undefined, unit: tempUnit || "C" }
      : city
        ? { city, unit: tempUnit || "C" }
        : {},
  );

  // Currency: just show home currency symbol, no conversion in navbar

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropdown(false);
        setTempPopover(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load notifications from localStorage on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    try {
      const stored = localStorage.getItem("travel_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const initial = getInitialNotifications();
        localStorage.setItem("travel_notifications", JSON.stringify(initial));
        setNotifications(initial);
      }
    } catch {
      const initial = getInitialNotifications();
      setNotifications(initial);
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem("travel_notifications", JSON.stringify(updated));
    } catch {}
  };

  const markOneRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    setNotifications(updated);
    try {
      localStorage.setItem("travel_notifications", JSON.stringify(updated));
    } catch {}
  };

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#FFFFFF",
          borderBottom: "1px solid #F0F0F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          height: 64,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
          ref={dropRef}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            <Plane size={22} style={{ color: "var(--orange)" }} />
            <span style={{ fontSize: 20, fontWeight: 800 }}>
              <span style={{ color: "#0A0A0A" }}>Travel</span>
              <span style={{ color: "var(--orange)" }}>AI</span>
            </span>
          </Link>

          {/* Center nav links (desktop) */}
          <div
            className="hidden md:flex"
            style={{ gap: 32, alignItems: "center" }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#FF4500")}
                onMouseLeave={(e) => (e.target.style.color = "#374151")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right controls (desktop) */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 6 }}
          >
            {/* Currency — user's home currency */}
            <span
              style={{
                padding: "6px 14px",
                border: "1px solid var(--border)",
                borderRadius: 50,
                background: "#FFF",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                whiteSpace: "nowrap",
              }}
            >
              {locLoading ? "..." : getCurrencySymbol(homeCurrency || "USD")}
            </span>

            {/* Country flag — hover shows city/country */}
            <div style={{ position: "relative" }}>
              <button
                onMouseEnter={() => setFlagTooltip(true)}
                onMouseLeave={() => setFlagTooltip(false)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: 50,
                  background: "#FFF",
                  cursor: "default",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {locLoading ? (
                  <span style={{ fontSize: 13 }}>...</span>
                ) : countryCode ? (
                  <img
                    src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                    alt={country || countryCode}
                    width={24}
                    height={18}
                    style={{ display: "block", borderRadius: 2 }}
                  />
                ) : (
                  <span style={{ fontSize: 16 }}>🌍</span>
                )}
              </button>
              {/* Location source indicator dot */}
              {!locLoading && locationSource && (
                <span
                  title={
                    locationSource === "gps"
                      ? "🎯 GPS location"
                      : "📡 IP location"
                  }
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      locationSource === "gps" ? "#22C55E" : "#EAB308",
                    border: "1.5px solid #FFF",
                    pointerEvents: "none",
                  }}
                />
              )}
              {flagTooltip && !locLoading && (city || country) && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#FFF",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    padding: "10px 16px",
                    whiteSpace: "nowrap",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  {city && <span>📍 {city}</span>}
                  {country && <span>🌍 {country}</span>}
                  {locationSource && (
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {locationSource === "gps" ? "🎯 GPS" : "📡 IP"} detected
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Temperature — click for details, shows destination city weather */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setTempPopover(!tempPopover)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 8px",
                  fontFamily: "inherit",
                }}
              >
                {weatherLoading
                  ? "..."
                  : temp !== null
                    ? `${weatherIcon || ""} ${temp}°${tempUnit || "C"}`
                    : `--°${tempUnit || "C"}`}
              </button>
              {tempPopover && !weatherLoading && temp !== null && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#FFF",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    padding: "10px 16px",
                    whiteSpace: "nowrap",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  {feelsLike !== null && (
                    <span>
                      🌡️ Feels like {Math.round(feelsLike)}°{tempUnit || "C"}
                    </span>
                  )}
                  {humidity !== null && <span>💧 Humidity {humidity}%</span>}
                  {windSpeed !== null && (
                    <span>
                      🌬️ Wind {windSpeed} {tempUnit === "F" ? "mph" : "m/s"}
                    </span>
                  )}
                  {condition && <span>☁️ {condition}</span>}
                  {weatherCity && <span>📍 {weatherCity}</span>}
                </div>
              )}
            </div>

            {/* Notification Bell — between temperature and user avatar */}
            {isAuthenticated && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "#FFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{ fontSize: 16 }}>🔔</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#EF4444",
                        color: "#FFF",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #FFF",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: 44,
                      right: 0,
                      background: "#FFF",
                      border: "1px solid var(--border-light)",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      padding: 0,
                      minWidth: 320,
                      maxHeight: 400,
                      overflowY: "auto",
                      zIndex: 100,
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #F3F4F6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0A0A0A",
                        }}
                      >
                        🔔 Notifications
                      </span>
                      <button
                        onClick={markAllRead}
                        style={{
                          fontSize: 12,
                          color: "#FF4500",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontFamily: "inherit",
                        }}
                      >
                        Mark all ✓
                      </button>
                    </div>
                    {/* Notification items */}
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "24px 16px",
                          textAlign: "center",
                          fontSize: 13,
                          color: "#9CA3AF",
                        }}
                      >
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markOneRead(n.id)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            width: "100%",
                            padding: "10px 16px",
                            border: "none",
                            borderBottom: "1px solid #F9FAFB",
                            background: n.read ? "#FFF" : "#FFF7ED",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: "inherit",
                          }}
                        >
                          <span style={{ fontSize: 18, flexShrink: 0 }}>
                            {NOTIF_ICONS[n.type] || "🔔"}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: n.read ? 400 : 600,
                                color: "#0A0A0A",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              {n.message}
                            </p>
                            <span
                              style={{
                                fontSize: 11,
                                color: "#9CA3AF",
                                marginTop: 2,
                                display: "block",
                              }}
                            >
                              {timeAgo(n.time)}
                            </span>
                          </div>
                          {!n.read && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#FF4500",
                                flexShrink: 0,
                                marginTop: 6,
                              }}
                            />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User dropdown */}
            <div style={{ position: "relative", marginLeft: 8 }}>
              <button
                onClick={() => {
                  setUserDropdown(!userDropdown);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: isAuthenticated ? "var(--orange)" : "#F5F5F5",
                  color: isAuthenticated ? "#FFF" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {isAuthenticated ? (
                  user?.name?.[0]?.toUpperCase() || "U"
                ) : (
                  <User size={16} />
                )}
              </button>
              {userDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: 44,
                    right: 0,
                    background: "#FFF",
                    border: "1px solid var(--border-light)",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    padding: 8,
                    minWidth: 200,
                    zIndex: 100,
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <div
                        style={{
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--border-light)",
                          marginBottom: 4,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0A0A0A",
                          }}
                        >
                          {user?.name}
                        </p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                          {user?.email}
                        </p>
                      </div>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            router.push("/admin");
                            setUserDropdown(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            background: "transparent",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#374151",
                            fontFamily: "inherit",
                          }}
                        >
                          🛠️ Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          setUserDropdown(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#374151",
                          fontFamily: "inherit",
                        }}
                      >
                        <Globe size={15} /> Dashboard
                      </button>
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setUserDropdown(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#374151",
                          fontFamily: "inherit",
                        }}
                      >
                        <User size={15} /> My Profile
                      </button>
                      <button
                        onClick={() => {
                          router.push("/trips");
                          setUserDropdown(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#374151",
                          fontFamily: "inherit",
                        }}
                      >
                        <MapPin size={15} /> My Trips
                      </button>
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setUserDropdown(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#374151",
                          fontFamily: "inherit",
                        }}
                      >
                        <Settings size={15} /> Settings
                      </button>
                      <div
                        style={{
                          borderTop: "1px solid var(--border-light)",
                          marginTop: 4,
                          paddingTop: 4,
                        }}
                      >
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdown(false);
                            router.push("/");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            background: "transparent",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#EF4444",
                            fontFamily: "inherit",
                          }}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setLoginOpen(true);
                          setUserDropdown(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 12px",
                          border: "none",
                          background: "transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0A0A0A",
                          textAlign: "left",
                          fontFamily: "inherit",
                        }}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setRegisterOpen(true);
                          setUserDropdown(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 12px",
                          border: "none",
                          background: "transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--orange)",
                          textAlign: "left",
                          fontFamily: "inherit",
                        }}
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#0A0A0A",
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              background: "#FFF",
              borderTop: "1px solid var(--border-light)",
              padding: "16px 24px",
            }}
            className="md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 0",
                  color: "#0A0A0A",
                  textDecoration: "none",
                  fontSize: 16,
                  fontWeight: 500,
                  borderBottom: "1px solid #F5F5F5",
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ paddingTop: 16, display: "flex", gap: 12 }}>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      color: "#374151",
                      textDecoration: "none",
                      fontSize: 15,
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    style={{
                      color: "#EF4444",
                      background: "none",
                      border: "none",
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      setMobileOpen(false);
                    }}
                    style={{
                      color: "#374151",
                      background: "none",
                      border: "none",
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setRegisterOpen(true);
                      setMobileOpen(false);
                    }}
                    className="btn-orange"
                    style={{ padding: "10px 24px", fontSize: 14 }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

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
    </>
  );
}
