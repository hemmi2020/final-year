"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle, X, LogIn } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // OTP state for unverified users
  const [needsVerify, setNeedsVerify] = useState(false);
  const [otp, setOtp] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.login(form);
      setUser(data.data.user, data.data.token);
      onClose();
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.requiresVerification
      ) {
        setNeedsVerify(true);
        setError("");
      } else {
        setError(err.response?.data?.error || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Enter 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.verify({ email: form.email, otp });
      setUser(data.data.user, data.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.resendOTP(form.email);
      setError("New code sent!");
    } catch {}
  };

  const S = {
    label: {
      display: "block",
      fontSize: 14,
      fontWeight: 600,
      color: "#0A0A0A",
      marginBottom: 6,
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1.5px solid #E5E7EB",
      borderRadius: 12,
      fontSize: 15,
      fontFamily: "inherit",
      color: "#0A0A0A",
      outline: "none",
    },
    btn: {
      width: "100%",
      height: 48,
      borderRadius: 50,
      border: "none",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      background: "linear-gradient(135deg, #FF4500, #FF6B35)",
      color: "#FFFFFF",
    },
    btnOutline: {
      width: "100%",
      height: 48,
      borderRadius: 50,
      border: "2px solid #E5E7EB",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      background: "#FFFFFF",
      color: "#374151",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    link: {
      color: "#FF4500",
      fontWeight: 600,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 14,
    },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div style={{ padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#FFF5F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <LogIn size={22} style={{ color: "#FF4500" }} />
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0A0A0A",
              margin: 0,
            }}
          >
            {needsVerify ? "Verify Your Email" : "Welcome Back"}
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
            {needsVerify
              ? `Enter the code sent to ${form.email}`
              : "Sign in to continue your journey"}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: error.includes("sent") ? "#E8F5E9" : "#FEF2F2",
              border: `1px solid ${error.includes("sent") ? "#A5D6A7" : "#FECACA"}`,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: error.includes("sent") ? "#2E7D32" : "#EF4444",
                flex: 1,
              }}
            >
              {error}
            </span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {needsVerify ? (
          /* OTP Verification */
          <div>
            <label style={S.label}>Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                ...S.input,
                textAlign: "center",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 8,
                marginBottom: 16,
              }}
            />
            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              style={{
                ...S.btn,
                opacity: loading || otp.length !== 6 ? 0.5 : 1,
                marginBottom: 12,
              }}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
              Didn't get the code?{" "}
              <button onClick={handleResend} style={S.link}>
                Resend
              </button>
            </p>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                style={S.input}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0A" }}
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  style={{
                    fontSize: 13,
                    color: "#FF4500",
                    textDecoration: "none",
                  }}
                >
                  Forgot?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Enter password"
                  required
                  style={{ ...S.input, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9CA3AF",
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btn, opacity: loading ? 0.6 : 1, marginBottom: 12 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {!needsVerify && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "16px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div>
            <button
              onClick={() => {
                window.location.href =
                  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
                  "/api/auth/google";
              }}
              style={S.btnOutline}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#6B7280",
                marginTop: 16,
              }}
            >
              Don't have an account?{" "}
              <button onClick={onSwitchToRegister} style={S.link}>
                Sign up
              </button>
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
