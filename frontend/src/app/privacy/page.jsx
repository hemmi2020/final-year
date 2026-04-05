export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
      <p className="section-label">Legal</p>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#0A0A0A",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Privacy Policy
      </h1>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 48 }}>
        Last updated: April 6, 2026
      </p>

      {[
        {
          title: "1. Information We Collect",
          content:
            "We collect information you provide directly: name, email, travel preferences (dietary, budget, interests, travel style), and trip data. We also collect usage data including chat conversations with our AI assistant, search queries, and interaction patterns to improve recommendations.",
        },
        {
          title: "2. How We Use Your Information",
          content:
            "Your data is used to: personalize AI-generated itineraries, remember your preferences across sessions, provide weather and currency data in your preferred units, improve our recommendation engine, and communicate service updates.",
        },
        {
          title: "3. Data Storage & Security",
          content:
            "User data is stored in MongoDB Atlas (encrypted at rest). Conversation memory is stored in Redis (Upstash) with 24-hour TTL. Passwords are hashed using bcrypt. All API communications use HTTPS. We never store raw API keys on the client side.",
        },
        {
          title: "4. Third-Party Services",
          content:
            "We use: OpenAI (AI generation), OpenWeatherMap (weather data), ExchangeRate-API (currency), OpenStreetMap/Nominatim (geocoding), Neo4j Aura (knowledge graph), Pinecone (vector search). Each service has its own privacy policy.",
        },
        {
          title: "5. Your Rights",
          content:
            "You can: access your data via your profile, update or delete your preferences, request account deletion, export your trip data. Contact us at privacy@travelai.com for any requests.",
        },
        {
          title: "6. Cookies",
          content:
            "We use localStorage for authentication tokens and user preferences (via Zustand persist). We do not use third-party tracking cookies.",
        },
        {
          title: "7. Contact",
          content:
            "For privacy-related questions, contact us at privacy@travelai.com.",
        },
      ].map((s) => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0A0A0A",
              marginBottom: 8,
            }}
          >
            {s.title}
          </h2>
          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.7 }}>
            {s.content}
          </p>
        </div>
      ))}
    </div>
  );
}
