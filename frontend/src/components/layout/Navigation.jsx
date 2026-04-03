"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useAuthStore } from "@/store/authStore";
import { User, LogOut, Menu, X } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "AI Chat" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "About" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 10;
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "#FFFFFF",
          borderBottom: isScrolled
            ? "1px solid #F0F0F0"
            : "1px solid transparent",
          boxShadow: isScrolled ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0A0A0A",
              textDecoration: "none",
            }}
          >
            TravelAI
          </Link>

          {/* Desktop Nav */}
          <div
            style={{ display: "flex", gap: 32, alignItems: "center" }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "#6B7280",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#0A0A0A")}
                onMouseLeave={(e) => (e.target.style.color = "#6B7280")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div
            style={{ display: "flex", gap: 12, alignItems: "center" }}
            className="hidden md:flex"
          >
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#6B7280",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <User size={16} /> {user?.name}
                </Link>
                <button
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#6B7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setLoginOpen(true)}
                  style={{
                    color: "#6B7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="btn-coral"
                  style={{ padding: "10px 24px", fontSize: 14 }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
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
              background: "#FFFFFF",
              borderTop: "1px solid #F0F0F0",
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
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  style={{
                    color: "#6B7280",
                    background: "none",
                    border: "none",
                    fontSize: 15,
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      setMobileOpen(false);
                    }}
                    style={{
                      color: "#6B7280",
                      background: "none",
                      border: "none",
                      fontSize: 15,
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setRegisterOpen(true);
                      setMobileOpen(false);
                    }}
                    className="btn-coral"
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
