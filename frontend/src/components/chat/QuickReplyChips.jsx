"use client";

import { useState } from "react";

// ── Chip configurations per question type ──────────────────────────────────────

const CHIP_CONFIGS = {
  destination: [
    "Istanbul",
    "Dubai",
    "Paris",
    "Bali",
    "Tokyo",
    "London",
    "Barcelona",
    "Maldives",
  ],
  duration: ["3 days", "1 week", "2 weeks", "Custom"],
  travelCompanion: ["Solo", "With friends", "Family", "Couple"],
  vibe: [
    "History",
    "Food",
    "Shopping",
    "Adventure",
    "Nature",
    "Nightlife",
    "Culture",
    "Relaxation",
  ],
  budget: ["Budget", "Mid-range", "Luxury"],
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const containerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  padding: "8px 0",
};

function getChipStyle(isSelected) {
  return {
    padding: "8px 18px",
    borderRadius: 999,
    border: isSelected ? "1.5px solid #FF4500" : "1.5px solid #E5E7EB",
    background: isSelected ? "#FF4500" : "#FFFFFF",
    color: isSelected ? "#FFFFFF" : "#374151",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    userSelect: "none",
    whiteSpace: "nowrap",
  };
}

const continueButtonStyle = {
  padding: "10px 24px",
  borderRadius: 999,
  border: "none",
  background: "#FF4500",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "all 0.2s ease",
  outline: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginTop: 4,
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function QuickReplyChips({
  questionType,
  onSelect,
  multiSelect = false,
}) {
  const [selected, setSelected] = useState([]);

  const chips = CHIP_CONFIGS[questionType];
  if (!chips) return null;

  const handleChipClick = (value) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
    } else {
      onSelect(value);
    }
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      onSelect(selected);
    }
  };

  return (
    <div style={{ padding: "4px 0 8px" }}>
      <div style={containerStyle}>
        {chips.map((chip) => {
          const isSelected = multiSelect && selected.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              aria-pressed={isSelected}
              style={getChipStyle(isSelected)}
              onClick={() => handleChipClick(chip)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#FF4500";
                  e.currentTarget.style.color = "#FF4500";
                  e.currentTarget.style.background = "#FFF5F0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {multiSelect && selected.length > 0 && (
        <button
          type="button"
          style={continueButtonStyle}
          onClick={handleContinue}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#E63E00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FF4500";
          }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}
