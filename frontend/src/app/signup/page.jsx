"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Check, Plane } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";

const COUNTRIES = [
  "🇺🇸 United States",
  "🇬🇧 United Kingdom",
  "🇵🇰 Pakistan",
  "🇦🇪 UAE",
  "🇮🇳 India",
  "🇩🇪 Germany",
  "🇫🇷 France",
  "🇹🇷 Turkey",
  "🇯🇵 Japan",
  "🇦🇺 Australia",
];
const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "INR", "JPY", "AUD"];

function getStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "🇺🇸 United States",
    currency: "USD",
    tempUnit: "C",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const strength = getStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthClass = [
    "",
    "strength-weak",
    "strength-fair",
    "strength-strong",
  ][strength];

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2)
      e.name = "Please enter your full name";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address";
    if (
      !form.password ||
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      !/[^A-Za-z0-9]/.test(form.password)
    )
      e.password =
        "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character";
    if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validate());
  };

  const isValid = (field) =>
    touched[field] && !validate()[field] && form[field];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const { data } = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (data.data.requiresVerification) {
        router.push(`/verify?email=${encodeURIComponent(form.email)}`);
      } else {
        setUser(data.data.user, data.data.token);
        router.push("/chat");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0] ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder, children }) => (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          onBlur={() => handleBlur(field)}
          className={`input-field ${touched[field] && errors[field] ? "error" : ""}`}
          placeholder={placeholder}
          style={{ paddingRight: children ? 48 : 16 }}
        />
        {children}
        {isValid(field) && (
          <Check
            size={18}
            style={{
              position: "absolute",
              right: children ? 48 : 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--success)",
            }}
          />
        )}
      </div>
      {touched[field] && errors[field] && (
        <p style={{ fontSize: 13, color: "var(--error)", marginTop: 4 }}>
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Left image */}
      <div
        className="hidden lg:block"
        style={{ flex: 1, position: "relative" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"
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
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
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
            Create your account
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 28,
            }}
          >
            Start planning your dream trips with AI
          </p>

          {serverError && (
            <div
              style={{
                padding: "12px 16px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 12,
                marginBottom: 20,
                fontSize: 14,
                color: "var(--error)",
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Full Name" field="name" placeholder="Ahmed Hassan" />
            <Field
              label="Email Address"
              field="email"
              type="email"
              placeholder="you@example.com"
            />

            {/* Password with show/hide + strength */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  onBlur={() => handleBlur("password")}
                  className={`input-field ${touched.password && errors.password ? "error" : ""}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
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
              {form.password && (
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "#E5E7EB",
                      borderRadius: 2,
                    }}
                  >
                    <div className={`strength-bar ${strengthClass}`} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color:
                        strength === 1
                          ? "var(--error)"
                          : strength === 2
                            ? "var(--warning)"
                            : "var(--success)",
                    }}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
              {touched.password && errors.password && (
                <p
                  style={{ fontSize: 13, color: "var(--error)", marginTop: 4 }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            <Field
              label="Confirm Password"
              field="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
            />

            {/* Country + Currency + Temp row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                  }}
                >
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="input-field"
                  style={{ cursor: "pointer" }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                  }}
                >
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                  className="input-field"
                  style={{ cursor: "pointer" }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Temp unit toggle */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Temperature Unit
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  border: "1.5px solid var(--border)",
                  borderRadius: 50,
                  overflow: "hidden",
                  width: "fit-content",
                }}
              >
                {["C", "F"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setForm({ ...form, tempUnit: u })}
                    style={{
                      padding: "8px 24px",
                      border: "none",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background:
                        form.tempUnit === u ? "var(--orange)" : "#FFF",
                      color: form.tempUnit === u ? "#FFF" : "var(--text-body)",
                    }}
                  >
                    °{u}
                  </button>
                ))}
              </div>
            </div>

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
              {loading ? "Creating account..." : "Create My Account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--orange)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
