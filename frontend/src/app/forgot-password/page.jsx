"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Mail, ArrowLeft, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate sending reset email (backend endpoint can be added later)
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          <Plane size={24} style={{ color: "var(--orange)" }} />
          <span style={{ fontSize: 22, fontWeight: 800 }}>
            <span style={{ color: "#0A0A0A" }}>Travel</span>
            <span style={{ color: "var(--orange)" }}>AI</span>
          </span>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#E8F5E9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Check size={28} style={{ color: "#22C55E" }} />
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0A0A0A",
                marginBottom: 8,
              }}
            >
              Check your email
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32 }}>
              If an account exists for{" "}
              <span style={{ fontWeight: 600, color: "#0A0A0A" }}>{email}</span>
              , we've sent password reset instructions.
            </p>
            <Link
              href="/login"
              style={{
                color: "var(--orange)",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0A0A0A",
                marginBottom: 8,
              }}
            >
              Reset your password
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32 }}>
              Enter your email and we'll send you reset instructions.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0A0A0A",
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-orange"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%",
                  height: 50,
                  fontSize: 16,
                  marginBottom: 20,
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <Link
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#6B7280",
                textDecoration: "none",
                fontSize: 14,
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
