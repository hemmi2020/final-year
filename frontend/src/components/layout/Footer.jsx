"use client";

import Link from "next/link";

const links = {
  Product: [
    { href: "/chat", label: "AI Chat" },
    { href: "/destinations", label: "Destinations" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/blog", label: "Blog" },
  ],
  Resources: [
    { href: "/help", label: "Help Center" },
    { href: "/guides", label: "Travel Guides" },
    { href: "/api-docs", label: "API" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0" }}>
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 32px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(4, 1fr)",
            gap: 40,
            marginBottom: 48,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0A0A0A",
                marginBottom: 12,
              }}
            >
              TravelAI
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              AI-powered travel planning that understands your style, dietary
              needs, and budget.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {title}
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {items.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#0A0A0A")}
                    onMouseLeave={(e) => (e.target.style.color = "#6B7280")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid #F0F0F0",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
            © {new Date().getFullYear()} TravelAI. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Instagram", "TikTok", "X", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#F5F5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#6B7280",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {s[0]}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
