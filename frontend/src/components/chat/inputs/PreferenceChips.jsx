"use client";

import { useState } from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";

const PREFERENCES = [
  "🕌 Halal Food",
  "🏖️ Beach",
  "🏛️ History",
  "🛍️ Shopping",
  "🌿 Nature",
  "🎭 Culture",
  "👨‍👩‍👧 Family",
  "🎒 Adventure",
];

export default function PreferenceChips({ onSend }) {
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);

  const toggle = (pref) => {
    setSelected((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref],
    );
  };

  const handleConfirm = () => {
    if (selected.length === 0 || sending) return;
    setSending(true);
    setTimeout(() => {
      onSend(`I'm interested in ${selected.join(", ")}`);
      setSelected([]);
      setSending(false);
    }, 400);
  };

  const hasSelection = selected.length > 0;

  return (
    <div style={{ padding: "12px 0" }}>
      {/* Chips grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {PREFERENCES.map((pref) => {
          const isSelected = selected.includes(pref);
          return (
            <button
              key={pref}
              onClick={() => toggle(pref)}
              style={{
                padding: "9px 18px",
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 600,
                border: "2px solid",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                background: isSelected ? "var(--orange)" : "#FFF",
                color: isSelected ? "#FFF" : "#ea580c",
                borderColor: isSelected ? "var(--orange)" : "#fed7aa",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isSelected && <Check size={14} strokeWidth={3} />}
              {pref}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border-light, #F0F0F0)",
          margin: "14px 0",
        }}
      />

      {/* Confirm button — visually distinct from chips */}
      <button
        onClick={handleConfirm}
        disabled={!hasSelection || sending}
        style={{
          width: "100%",
          padding: "14px 24px",
          borderRadius: 14,
          border: "none",
          background: hasSelection
            ? "linear-gradient(135deg, #ea580c, #c2410c)"
            : "#E5E7EB",
          color: hasSelection ? "#FFF" : "#9CA3AF",
          fontSize: 15,
          fontWeight: 700,
          cursor: hasSelection ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: hasSelection ? "0 4px 14px rgba(234,88,12,0.35)" : "none",
          transition: "all 0.3s ease",
          transform: hasSelection ? "translateY(0)" : "translateY(0)",
        }}
      >
        {sending ? (
          <>
            <Loader2
              size={18}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Sending...
          </>
        ) : (
          <>
            Let's Plan! ✈️
            {hasSelection && (
              <span
                style={{
                  background: "rgba(255,255,255,0.25)",
                  padding: "2px 10px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {selected.length} selected
              </span>
            )}
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}
