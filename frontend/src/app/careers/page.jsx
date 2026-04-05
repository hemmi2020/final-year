import Link from "next/link";

export default function CareersPage() {
  const roles = [
    {
      title: "Senior Full-Stack Developer",
      type: "Full-time",
      location: "Remote",
      desc: "Build and scale our AI travel platform using Next.js, Express, and MongoDB.",
    },
    {
      title: "AI/ML Engineer",
      type: "Full-time",
      location: "Remote",
      desc: "Develop and optimize our LangGraph AI agent pipeline and knowledge graph.",
    },
    {
      title: "UI/UX Designer",
      type: "Contract",
      location: "Remote",
      desc: "Design beautiful, intuitive travel experiences across web and mobile.",
    },
    {
      title: "DevOps Engineer",
      type: "Full-time",
      location: "Remote",
      desc: "Manage cloud infrastructure, CI/CD pipelines, and database operations.",
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
      <p className="section-label">Join Us</p>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#0A0A0A",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Careers at TravelAI
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "#6B7280",
          lineHeight: 1.65,
          marginBottom: 48,
        }}
      >
        We're building the future of AI-powered travel. Join our team and help
        millions of travelers discover their perfect journey.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {roles.map((role) => (
          <div
            key={role.title}
            className="card-magazine"
            style={{ padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0A0A0A",
                    marginBottom: 6,
                  }}
                >
                  {role.title}
                </h3>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.5 }}>
                  {role.desc}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 99,
                    background: "#FFF3E0",
                    color: "var(--coral)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {role.type}
                </span>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 99,
                    background: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {role.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 48,
          padding: 32,
          background: "var(--bg-warm)",
          borderRadius: 20,
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#0A0A0A",
            marginBottom: 8,
          }}
        >
          Don't see your role?
        </h3>
        <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 20 }}>
          Send us your resume — we're always looking for talented people.
        </p>
        <a
          href="mailto:careers@travelai.com"
          className="btn-coral"
          style={{
            padding: "12px 28px",
            fontSize: 15,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
}
