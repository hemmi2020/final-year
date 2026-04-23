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

// ── Duration helpers ───────────────────────────────────────────────────────────

const DURATION_DAYS_MAP = {
  "3 days": 3,
  "1 week": 7,
  "2 weeks": 14,
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function getNextFriday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day <= 5 ? 5 - day : 7 - day + 5;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d.toISOString().split("T")[0];
}

function getIn2Weeks() {
  return addDays(getToday(), 14);
}

function getNextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

// ── Quick date chip configs ────────────────────────────────────────────────────

const QUICK_DATE_CHIPS = [
  { label: "Next Weekend", getStart: getNextFriday },
  { label: "In 2 weeks", getStart: getIn2Weeks },
  { label: "Next Month", getStart: getNextMonth },
  { label: "Custom Date", getStart: null },
];

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

const datePickerPanelStyle = {
  marginTop: 12,
  padding: 20,
  borderRadius: 16,
  border: "1.5px solid #E5E7EB",
  background: "#FAFAFA",
};

const dateInputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  background: "#FFFFFF",
  color: "#374151",
};

const confirmButtonStyle = {
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
  marginTop: 8,
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function QuickReplyChips({
  questionType,
  onSelect,
  multiSelect = false,
}) {
  const [selected, setSelected] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showQuickDates, setShowQuickDates] = useState(false);

  const chips = CHIP_CONFIGS[questionType];
  if (!chips) return null;

  const today = getToday();

  const handleChipClick = (value) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
      return;
    }

    // Duration-specific logic
    if (questionType === "duration") {
      if (value === "Custom") {
        setShowDatePicker(true);
        setShowQuickDates(false);
        setSelectedDuration(null);
        return;
      }

      const days = DURATION_DAYS_MAP[value];
      if (days) {
        setSelectedDuration(value);
        setShowQuickDates(true);
        setShowDatePicker(false);
        setStartDate("");
        setEndDate("");
        return;
      }
    }

    onSelect(value);
  };

  const handleQuickDateClick = (chip) => {
    if (!chip.getStart) {
      // "Custom Date" — open the full date picker
      setShowDatePicker(true);
      setShowQuickDates(false);
      setSelectedDuration(null);
      return;
    }

    const start = chip.getStart();
    const days = DURATION_DAYS_MAP[selectedDuration] || 3;
    const end = addDays(start, days);
    setStartDate(start);
    setEndDate(end);

    // Fire the original duration value
    onSelect(selectedDuration);
  };

  const handleConfirmDates = () => {
    if (!startDate || !endDate) return;
    const days = daysBetween(startDate, endDate);
    if (days <= 0) return;
    onSelect(`${days} days`);
  };

  const tripLength =
    startDate && endDate ? daysBetween(startDate, endDate) : null;

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

      {/* Quick date chips — shown after selecting a specific duration */}
      {questionType === "duration" && showQuickDates && selectedDuration && (
        <div style={{ marginTop: 10 }}>
          <p
            style={{
              fontSize: 13,
              color: "#6B7280",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            📅 When do you want to go?
          </p>
          <div style={containerStyle}>
            {QUICK_DATE_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                style={getChipStyle(false)}
                onClick={() => handleQuickDateClick(chip)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FF4500";
                  e.currentTarget.style.color = "#FF4500";
                  e.currentTarget.style.background = "#FFF5F0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.background = "#FFFFFF";
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline date picker — shown for "Custom" duration */}
      {questionType === "duration" && showDatePicker && (
        <div style={datePickerPanelStyle}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            📅 Select Your Trip Dates
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Departure
              </label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Reset end date if it's before new start
                  if (endDate && e.target.value > endDate) {
                    setEndDate("");
                  }
                }}
                style={dateInputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Return
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                style={dateInputStyle}
              />
            </div>
          </div>

          {tripLength !== null && tripLength > 0 && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#FF4500",
                marginBottom: 4,
              }}
            >
              Trip Length: {tripLength} day{tripLength !== 1 ? "s" : ""}
            </p>
          )}

          <button
            type="button"
            style={{
              ...confirmButtonStyle,
              opacity: tripLength && tripLength > 0 ? 1 : 0.5,
              cursor: tripLength && tripLength > 0 ? "pointer" : "not-allowed",
            }}
            disabled={!tripLength || tripLength <= 0}
            onClick={handleConfirmDates}
            onMouseEnter={(e) => {
              if (tripLength && tripLength > 0) {
                e.currentTarget.style.background = "#E63E00";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FF4500";
            }}
          >
            Confirm Dates →
          </button>
        </div>
      )}

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
