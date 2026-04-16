"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";

function getStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");

  const strength = getStrength(form.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (data.data.requiresVerification) {
        setStep("verify");
      } else {
        setUser(data.data.user, data.data.token);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0] ||
          "Registration failed.",
      );
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
      boxSizing: "border-box",
    },
    btn: {
      width: "100%",
      height: 48,
      borderRadius: 12,
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
      borderRadius: 12,
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          minHeight: 560,
          position: "relative",
        }}
        className="register-modal-inner"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            background: "rgba(255,255,255,0.85)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <X size={20} color="#374151" />
        </button>

        {/* LEFT COLUMN — Form (55%) */}
        <div
          style={{
            flex: "0 0 55%",
            padding: "36px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflowY: "auto",
          }}
          className="register-modal-left"
        >
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0A0A0A",
                margin: 0,
                marginBottom: 6,
              }}
            >
              {step === "verify" ? "Verify Your Email" : "Create Account"}
            </h2>
            {step === "verify" ? (
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                Enter the code sent to {form.email}
              </p>
            ) : (
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                Already have an account?{" "}
                <button onClick={onSwitchToLogin} style={S.link}>
                  Sign in
                </button>
              </p>
            )}
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

          {step === "verify" ? (
            /* OTP Step */
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
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <p
                style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}
              >
                Didn&apos;t get the code?{" "}
                <button onClick={handleResend} style={S.link}>
                  Resend
                </button>
              </p>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ahmed Hassan"
                  required
                  style={S.input}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
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
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
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
                {form.password && (
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background:
                            i <= strength
                              ? strength === 1
                                ? "#EF4444"
                                : strength === 2
                                  ? "#F59E0B"
                                  : "#22C55E"
                              : "#E5E7EB",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter password"
                  required
                  style={S.input}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...S.btn,
                  opacity: loading ? 0.6 : 1,
                  marginBottom: 12,
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          {step !== "verify" && (
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
                    (process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:5000") + "/api/auth/google";
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
                  fontSize: 12,
                  color: "#9CA3AF",
                  marginTop: 20,
                  lineHeight: 1.5,
                }}
              >
                By continuing, you agree to TravelAI&apos;s{" "}
                <a
                  href="/terms"
                  style={{ color: "#FF4500", textDecoration: "none" }}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  style={{ color: "#FF4500", textDecoration: "none" }}
                >
                  Privacy Policy
                </a>
              </p>
            </>
          )}
        </div>

        {/* RIGHT COLUMN — Travel Image (45%) */}
        <div
          style={{
            flex: "0 0 45%",
            position: "relative",
            borderRadius: "0 12px 12px 0",
            overflow: "hidden",
            minHeight: 560,
          }}
          className="register-modal-right"
        >
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"
            alt="Travel destination"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          {/* Orange gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(255,69,0,0.55) 0%, rgba(255,107,53,0.45) 50%, rgba(255,140,0,0.35) 100%)",
            }}
          />
          {/* Speech bubble */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 28,
              right: 28,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: "20px 24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#0A0A0A",
                lineHeight: 1.5,
              }}
            >
              Join thousands of travelers planning smarter trips ✈️
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              Powered by TravelAI
            </p>
          </div>
        </div>

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 768px) {
            .register-modal-inner {
              flex-direction: column !important;
              min-height: auto !important;
            }
            .register-modal-left {
              flex: 1 1 auto !important;
              padding: 28px 20px !important;
            }
            .register-modal-right {
              flex: 0 0 200px !important;
              min-height: 200px !important;
              border-radius: 0 0 12px 12px !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
