"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [toggles, setToggles] = useState({
    location: true,
    preferences: true,
    tripHistory: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setVisible(false);
  };

  const handleManageSave = () => {
    localStorage.setItem(CONSENT_KEY, "managed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#FFFFFF",
        borderTop: "1px solid #E5E7EB",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
        padding: "20px 24px",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#374151",
              margin: 0,
              flex: 1,
              minWidth: 280,
              lineHeight: 1.6,
            }}
          >
            🍪 We use cookies to enhance your experience. We store location
            data, preferences and trip history.
          </p>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              onClick={handleAccept}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                background: "#FF4500",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 50,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.2s",
              }}
            >
              Accept All
            </button>
            <button
              onClick={() => setShowManage(!showManage)}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                background: "transparent",
                color: "#FF4500",
                border: "2px solid #FF4500",
                borderRadius: 50,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
            >
              Manage
            </button>
            <button
              onClick={handleReject}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                background: "transparent",
                color: "#6B7280",
                border: "none",
                borderRadius: 50,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
              }}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Manage toggles section */}
        {showManage && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #E5E7EB",
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
            }}
          >
            {[
              { key: "location", label: "Location Data" },
              { key: "preferences", label: "Preferences" },
              { key: "tripHistory", label: "Trip History" },
            ].map(({ key, label }) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <div
                  onClick={() =>
                    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    background: toggles[key] ? "#FF4500" : "#D1D5DB",
                    position: "relative",
                    transition: "background 0.2s",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      position: "absolute",
                      top: 3,
                      left: toggles[key] ? 21 : 3,
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                {label} {toggles[key] ? "✓" : ""}
              </label>
            ))}
            <button
              onClick={handleManageSave}
              style={{
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 700,
                background: "#FF4500",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 50,
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
