export default function CookiesPage() {
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
        Cookie Policy
      </h1>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 48 }}>
        Last updated: April 6, 2026
      </p>

      {[
        {
          title: "1. What Are Cookies?",
          content:
            "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.",
        },
        {
          title: "2. How We Use Storage",
          content:
            "TravelAI primarily uses localStorage (not traditional cookies) to store: your authentication token (JWT), user preferences via Zustand persist middleware, and theme settings. This data stays on your device and is not sent to third-party servers.",
        },
        {
          title: "3. Essential Storage",
          content:
            "Authentication token: Required to keep you logged in across page refreshes. Stored in localStorage under 'auth-storage'. Automatically cleared on logout.",
        },
        {
          title: "4. Preference Storage",
          content:
            "Your travel preferences (dietary, budget, currency, temperature unit) are cached locally for faster page loads. This data syncs with our server when you update settings.",
        },
        {
          title: "5. Third-Party Cookies",
          content:
            "We do not use third-party tracking cookies. We do not use Google Analytics, Facebook Pixel, or any advertising trackers. External images from Unsplash may set their own cookies.",
        },
        {
          title: "6. Managing Your Data",
          content:
            "You can clear all stored data by: logging out (clears auth token), clearing your browser's localStorage, or using your browser's developer tools to remove specific keys.",
        },
        {
          title: "7. Contact",
          content:
            "For questions about our cookie policy, contact us at privacy@travelai.com.",
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
