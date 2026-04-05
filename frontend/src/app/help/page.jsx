"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does the AI plan my trip?",
    a: "Our AI agent uses a multi-step pipeline: it loads your preferences, searches our knowledge graph for restaurants and attractions, checks real-time weather and currency data, then generates a personalized day-by-day itinerary using GPT-4o-mini.",
  },
  {
    q: "Do I need to create an account to chat?",
    a: "No! You can chat with our AI freely without logging in. You only need an account to save itineraries, create trips, and access your dashboard.",
  },
  {
    q: "How does the halal food feature work?",
    a: "When you set 'halal' in your dietary preferences, our knowledge graph filters all restaurant recommendations to only show halal-certified options near your planned attractions.",
  },
  {
    q: "What currencies are supported?",
    a: "We support 165+ currencies via ExchangeRate-API. Set your preferred currency in Settings and all cost estimates will automatically convert.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use JWT authentication, bcrypt password hashing, HTTPS encryption, and rate limiting. Your API keys are never exposed to the frontend.",
  },
  {
    q: "Can I plan group trips?",
    a: "Yes! Create a group, invite members via email or invite code, and collaborate with real-time location sharing and group chat via Socket.io.",
  },
  {
    q: "How accurate is the weather data?",
    a: "We use OpenWeatherMap's real-time API. Weather data is fetched at the time of itinerary generation and the AI adjusts activities accordingly (indoor for rain, outdoor for sun).",
  },
  {
    q: "Is TravelAI free?",
    a: "The core features are free — AI chat, destination search, weather, and currency conversion. Premium features like unlimited itinerary generation may have usage limits.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
      <p className="section-label">Support</p>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#0A0A0A",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Help Center
      </h1>
      <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 48 }}>
        Find answers to common questions about TravelAI
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                background: open === i ? "#FAF9F7" : "#FFFFFF",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0A" }}>
                {faq.q}
              </span>
              <ChevronDown
                size={20}
                style={{
                  color: "#9CA3AF",
                  transform: open === i ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>
            {open === i && (
              <div style={{ padding: "0 24px 18px", background: "#FAF9F7" }}>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.65 }}>
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
