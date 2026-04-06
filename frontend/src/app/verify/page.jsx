"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";
import { Mail, Plane, RefreshCw } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const setUser = useAuthStore((s) => s.setUser);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      refs[index - 1].current?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      refs[5].current?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.verify({ email, otp: code });
      setUser(data.data.user, data.data.token);
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
    } finally {
      setResending(false);
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
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--orange-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Mail size={28} style={{ color: "var(--orange)" }} />
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
          We sent a 6-digit code to{" "}
          <span style={{ fontWeight: 600, color: "#0A0A0A" }}>{email}</span>
        </p>

        {error && (
          <div
            style={{
              padding: "10px 16px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 14,
              color: "#EF4444",
            }}
          >
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginBottom: 24,
          }}
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 52,
                height: 60,
                textAlign: "center",
                fontSize: 24,
                fontWeight: 700,
                border: `2px solid ${digit ? "var(--orange)" : "#E5E7EB"}`,
                borderRadius: 12,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--orange)")}
              onBlur={(e) => {
                if (!digit) e.target.style.borderColor = "#E5E7EB";
              }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="btn-orange"
          disabled={loading || otp.join("").length !== 6}
          style={{ width: "100%", height: 50, fontSize: 16, marginBottom: 16 }}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              color: "var(--orange)",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {resending ? "Sending..." : resent ? "✓ Code sent!" : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 64px)",
          }}
        >
          Loading...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
