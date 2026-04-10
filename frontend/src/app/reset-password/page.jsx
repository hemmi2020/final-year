"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Plane, Check, ArrowLeft, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const errs = {};
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset token is invalid or has expired",
      );
    } finally {
      setLoading(false);
    }
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

        {success ? (
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
              Password reset successful
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32 }}>
              Your password has been updated. You can now log in with your new
              password.
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                color: "var(--orange)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                fontFamily: "inherit",
              }}
            >
              ← Go to Login
            </button>
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
              Set new password
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32 }}>
              Enter your new password below.
            </p>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#FEF2F2",
                  borderRadius: 10,
                  border: "1px solid #FECACA",
                  marginBottom: 20,
                  fontSize: 14,
                  color: "#DC2626",
                }}
              >
                {error}
                <button
                  onClick={() => router.push("/forgot-password")}
                  style={{
                    display: "block",
                    marginTop: 8,
                    color: "var(--orange)",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  Request a new reset link →
                </button>
              </div>
            )}

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
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="At least 8 characters"
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9CA3AF",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.password}
                  </p>
                )}
              </div>

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
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Confirm your password"
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9CA3AF",
                    }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-orange"
                disabled={loading || !password || !confirmPassword}
                style={{
                  width: "100%",
                  height: 50,
                  fontSize: 16,
                  marginBottom: 20,
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <button
              onClick={() => router.push("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#6B7280",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                margin: "0 auto",
                fontFamily: "inherit",
              }}
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <p style={{ color: "#6B7280" }}>Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
