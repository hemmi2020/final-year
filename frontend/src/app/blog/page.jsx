import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    title: "How AI is Revolutionizing Travel Planning",
    date: "Mar 28, 2026",
    tag: "AI",
    img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    excerpt:
      "Discover how knowledge graphs and AI agents are creating personalized itineraries that adapt to your preferences in real-time.",
  },
  {
    title: "Top 10 Halal-Friendly Destinations in 2026",
    date: "Mar 20, 2026",
    tag: "Travel",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
    excerpt:
      "From Istanbul to Tokyo, these cities offer the best halal dining experiences alongside world-class attractions.",
  },
  {
    title: "Budget Travel: How to See the World for Less",
    date: "Mar 15, 2026",
    tag: "Tips",
    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    excerpt:
      "Our AI analyzed thousands of trips to find the best budget-friendly strategies for every type of traveler.",
  },
  {
    title: "The Science Behind Weather-Optimized Itineraries",
    date: "Mar 10, 2026",
    tag: "Tech",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    excerpt:
      "How we use real-time weather data to automatically adjust your travel plans for the best experience.",
  },
];

export default function BlogPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
      <p className="section-label">Blog</p>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#0A0A0A",
          marginTop: 8,
          marginBottom: 48,
        }}
      >
        Travel Stories & Insights
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {posts.map((post) => (
          <div
            key={post.title}
            className="card-magazine"
            style={{ overflow: "hidden", cursor: "pointer" }}
          >
            <div style={{ height: 200, position: "relative" }}>
              <Image
                src={post.img}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="400px"
              />
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: "#FFF3E0",
                  color: "var(--coral)",
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {post.tag}
              </span>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
                {post.date}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
