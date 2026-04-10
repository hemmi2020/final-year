"use client";

import { useState } from "react";
import { usersAPI } from "@/lib/api";
import { Lock, Eye, EyeOff, Info } from "lucide-react";

export default function PasswordChanger({ isOAuthUser }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  if (isOAuthUser) {
    return (
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Change Password
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            background: "#EFF6FF",
            borderRadius: 12,
            border: "1px solid #BFDBFE",
          }}
        >
          <Info size={18} style={{ color: "#3B82F6", flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "#1E40AF", margin: 0 }}>
            Password management is not available for social login accounts
          </p>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (form.newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters";
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.currentPassword)
      errs.currentPassword = "Current password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (!validate()) return;

    setLoading(true);
    try {
      await usersAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ currentPassword: "Current password is incorrect" });
      } else {
        setErrors({
          general: err.response?.data?.message || "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "10px 40px 10px 12px",
    border: `1.5px solid ${hasError ? "var(--error, #EF4444)" : "var(--border)"}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    background: "#FFF",
  });

  const renderField = (label, field, showKey) => (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showPasswords[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          style={inputStyle(!!errors[field])}
          placeholder={label}
        />
        <button
          type="button"
          onClick={() =>
            setShowPasswords({
              ...showPasswords,
              [showKey]: !showPasswords[showKey],
            })
          }
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          {showPasswords[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[field] && (
        <p
          style={{ color: "var(--error, #EF4444)", fontSize: 12, marginTop: 4 }}
        >
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        Change Password
      </h3>

      {success && (
        <div
          style={{
            padding: "12px 16px",
            background: "#E8F5E9",
            borderRadius: 10,
            border: "1px solid #A5D6A7",
            marginBottom: 16,
            fontSize: 14,
            color: "#2E7D32",
          }}
        >
          {success}
        </div>
      )}

      {errors.general && (
        <div
          style={{
            padding: "12px 16px",
            background: "#FEF2F2",
            borderRadius: 10,
            border: "1px solid #FECACA",
            marginBottom: 16,
            fontSize: 14,
            color: "#DC2626",
          }}
        >
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {renderField("Current Password", "currentPassword", "current")}
        {renderField("New Password", "newPassword", "new")}
        {renderField("Confirm New Password", "confirmPassword", "confirm")}
        <button
          type="submit"
          className="btn-orange"
          disabled={loading}
          style={{ padding: "12px 28px", fontSize: 15 }}
        >
          <Lock size={16} style={{ marginRight: 6 }} />
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
