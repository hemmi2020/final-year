import Image from "next/image";

const guides = [
  {
    title: "Tokyo Travel Guide",
    subtitle: "Culture, food, and technology in Japan's capital",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    highlights: [
      "Senso-ji Temple",
      "Halal Ramen in Asakusa",
      "TeamLab Borderless",
      "Shibuya Crossing",
    ],
  },
  {
    title: "Istanbul Travel Guide",
    subtitle: "Where East meets West — mosques, bazaars, and cuisine",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
    highlights: [
      "Hagia Sophia",
      "Grand Bazaar",
      "Sultanahmet Koftecisi",
      "Bosphorus Cruise",
    ],
  },
  {
    title: "Paris Travel Guide",
    subtitle: "Art, romance, and world-class dining",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Montmartre"],
  },
  {
    title: "Dubai Travel Guide",
    subtitle: "Futuristic luxury and desert adventures",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Gold Souk"],
  },
];

export default function GuidesPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
      <p className="section-label">Guides</p>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#0A0A0A",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Travel Guides
      </h1>
      <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 48 }}>
        In-depth guides for our most popular destinations
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {guides.map((g) => (
          <div
            key={g.title}
            className="card-magazine"
            style={{ display: "flex", overflow: "hidden", flexWrap: "wrap" }}
          >
            <div
              style={{
                width: 300,
                minHeight: 220,
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Image
                src={g.img}
                alt={g.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="300px"
              />
            </div>
            <div style={{ flex: 1, padding: "28px 32px", minWidth: 280 }}>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginBottom: 6,
                }}
              >
                {g.title}
              </h3>
              <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 16 }}>
                {g.subtitle}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {g.highlights.map((h) => (
                  <span
                    key={h}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      background: "#FFF3E0",
                      color: "var(--coral)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
