"use client";

import { useState } from "react";
import { Loader2, Calendar, Sparkles } from "lucide-react";

export default function GenerateItinerary({
  onSend,
  destination = "",
  duration = "",
  preferences = [],
}) {
  const [sending, setSending] = useState(false);

  const handleGenerate = () => {
    if (sending) return;
    setSending(true);

    const dest = destination || "my chosen destination";
    const dur = duration || "the discussed duration";
    const prefs =
      preferences.length > 0 ? preferences.join(", ") : "my selected interests";

    const prompt = `Generate a complete day-by-day itinerary for ${dest} for ${dur} with focus on ${prefs}. Include morning, afternoon, evening activities for each day, halal restaurant recommendations for each meal, estimated costs, and travel tips.`;

    setTimeout(() => {
      onSend(prompt);
      setSending(false);
    }, 500);
  };

  return (
    <div style={{ padding: "16px 0" }}>
      <button
        onClick={handleGenerate}
        disabled={sending}
        style={{
          width: "100%",
          minHeight: 56,
          padding: "16px 28px",
          borderRadius: 16,
          border: "none",
          background: sending
            ? "#D1D5DB"
            : "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
          color: "#FFF",
          fontSize: 17,
          fontWeight: 800,
          cursor: sending ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          boxShadow: sending
            ? "none"
            : "0 6px 24px rgba(234, 88, 12, 0.4), 0 2px 8px rgba(234, 88, 12, 0.2)",
          transition: "all 0.3s ease",
          letterSpacing: "0.01em",
        }}
      >
        {sending ? (
          <>
            <Loader2
              size={22}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Generating your itinerary...
          </>
        ) : (
          <>
            <span style={{ fontSize: 22 }}>📅</span>
            Generate My Full Itinerary →
          </>
        )}
      </button>
    </div>
  );
}
