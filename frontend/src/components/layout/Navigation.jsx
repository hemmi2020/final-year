"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScrollPosition } from "@/hooks/useScrollPosition";
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
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Trip Planner" },
  { href: "/chat", label: "AI Chat" },
  { href: "/community", label: "Community" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "About" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "Pound" },
  { code: "PKR", symbol: "Rs", label: "Rupee" },
  { code: "AED", symbol: "د.إ", label: "Dirham" },
  { code: "INR", symbol: "₹", label: "Rupee" },
];

export default function Navigation() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [currDropdown, setCurrDropdown] = useState(false);
  const [tempUnit, setTempUnit] = useState("C");
  const [currency, setCurrency] = useState("USD");
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 10;
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const dropRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropdown(false);
        setCurrDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currSymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#FFFFFF",
          borderBottom: `1px solid ${isScrolled ? "#F0F0F0" : "transparent"}`,
          boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
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
            style={{ alignItems: "center", gap: 4 }}
          >
            {/* Currency pill */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setCurrDropdown(!currDropdown);
                  setUserDropdown(false);
                }}
                style={{
                  padding: "6px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 50,
                  background: "#FFF",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#374151",
                  fontFamily: "inherit",
                }}
              >
                {currSymbol}
              </button>
              {currDropdown && (
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
                    minWidth: 160,
                    zIndex: 100,
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setCurrDropdown(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        background:
                          currency === c.code
                            ? "var(--orange-bg)"
                            : "transparent",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#0A0A0A",
                        fontFamily: "inherit",
                      }}
                    >
                      <span style={{ fontWeight: 700, width: 24 }}>
                        {c.symbol}
                      </span>{" "}
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Country flag pill */}
            <button
              style={{
                padding: "6px 12px",
                border: "1px solid var(--border)",
                borderRadius: 50,
                background: "#FFF",
                fontSize: 16,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              🇺🇸
            </button>

            {/* Temp toggle */}
            <button
              onClick={() => setTempUnit(tempUnit === "C" ? "F" : "C")}
              style={{
                padding: "6px 14px",
                border: "1px solid var(--border)",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                background: tempUnit === "C" ? "var(--orange)" : "#FFF",
                color: tempUnit === "C" ? "#FFF" : "var(--text-body)",
              }}
            >
              °{tempUnit}
            </button>

            {/* User dropdown */}
            <div style={{ position: "relative", marginLeft: 8 }}>
              <button
                onClick={() => {
                  setUserDropdown(!userDropdown);
                  setCurrDropdown(false);
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
                        <MapPin size={15} /> My Trips
                      </button>
                      <button
                        onClick={() => {
                          router.push("/settings");
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
