"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, X, Plane } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/chat";
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Please enter a valid email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setBanner("");
    try {
      const { data } = await authAPI.login(form);
      setUser(data.data.user, data.data.token);
      router.push(returnUrl);
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.requiresVerification
      ) {
        router.push(`/verify?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setBanner(
        err.response?.data?.error ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Left image */}
      <div
        className="hidden lg:block"
        style={{ flex: 1, position: "relative" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
          alt="Travel"
          fill
          style={{ objectFit: "cover" }}
          sizes="50vw"
          priority
        />
      </div>

      {/* Right form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 24px",
          overflowY: "auto",
          maxHeight: "calc(100vh - 64px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440, margin: "auto 0" }}>
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

          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 32,
            }}
          >
            Sign in to continue planning your trips
          </p>

          {/* Error banner */}
          {banner && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <AlertCircle
                size={18}
                style={{ color: "var(--error)", flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, color: "var(--error)", flex: 1 }}>
                {banner}
              </span>
              <button
                onClick={() => setBanner("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--error)",
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                className={`input-field ${touched.email && errors.email ? "error" : ""}`}
                placeholder="you@example.com"
              />
              {touched.email && errors.email && (
                <p
                  style={{ fontSize: 13, color: "var(--error)", marginTop: 4 }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  style={{
                    fontSize: 13,
                    color: "var(--orange)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  onBlur={() => handleBlur("password")}
                  className={`input-field ${touched.password && errors.password ? "error" : ""}`}
                  placeholder="Enter your password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p
                  style={{ fontSize: 13, color: "var(--error)", marginTop: 4 }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--orange)" }}
              />
              <span style={{ fontSize: 14, color: "var(--text-body)" }}>
                Remember me
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="btn-orange"
              disabled={loading}
              style={{
                width: "100%",
                height: 50,
                fontSize: 16,
                marginBottom: 20,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--orange)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
