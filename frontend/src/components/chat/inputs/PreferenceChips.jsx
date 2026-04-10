"use client";

import { useState } from "react";

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

const styles = {
  container: {
    padding: "12px 0",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  confirmButton: {
    padding: "10px 24px",
    borderRadius: 50,
    border: "none",
    background: "var(--orange)",
    color: "#FFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

export default function PreferenceChips({ onSend }) {
  const [selected, setSelected] = useState([]);

  const toggle = (pref) => {
    setSelected((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref],
    );
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    onSend(`I'm interested in ${selected.join(", ")}`);
    setSelected([]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {PREFERENCES.map((pref) => {
          const isSelected = selected.includes(pref);
          return (
            <button
              key={pref}
              onClick={() => toggle(pref)}
              style={{
                padding: "8px 18px",
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 500,
                border: "1.5px solid",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                background: isSelected ? "var(--orange)" : "#FFF",
                color: isSelected ? "#FFF" : "var(--text-body)",
                borderColor: isSelected ? "var(--orange)" : "var(--border)",
              }}
            >
              {pref}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleConfirm}
        style={{
          ...styles.confirmButton,
          opacity: selected.length > 0 ? 1 : 0.5,
        }}
        disabled={selected.length === 0}
      >
        Confirm ({selected.length})
      </button>
    </div>
  );
}
