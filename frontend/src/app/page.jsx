"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  Star,
  ArrowRight,
  MessageSquare,
  Globe,
  Brain,
  Cloud,
  DollarSign,
  Utensils,
  Zap,
  Users,
  Shield,
  Send,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ background: "#FFFFFF" }}>
      {/* ═══ HERO ═══ */}
      <section
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          height: "90vh",
          minHeight: 600,
          overflow: "hidden",
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85"
          alt="Sunny beach"
          fill
          style={{ objectFit: "cover" }}
          priority
          sizes="100vw"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 700,
              padding: "40px 24px",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              borderRadius: 24,
            }}
          >
            <h1
              style={{
                fontSize: "clamp(48px, 8vw, 96px)",
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              Travel Better.
            </h1>
            <p
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.9)",
                marginTop: 16,
                marginBottom: 32,
              }}
            >
              AI-powered itineraries tailored to your style
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => router.push("/planner")}
                className="btn-orange"
                style={{ padding: "16px 36px", fontSize: 16 }}
              >
                Start Planning
              </button>
              <button
                onClick={() => router.push("/destinations")}
                className="btn-ghost"
                style={{ padding: "16px 36px", fontSize: 16 }}
              >
                Explore Destinations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "🌍", label: "50+ Destinations" },
          { icon: "🤖", label: "AI-Powered" },
          { icon: "💬", label: "24/7 Chat Support" },
          { icon: "🕌", label: "Halal-Friendly" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0A" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <p className="section-label" style={{ color: "var(--orange)" }}>
            ✈️ How It Works
          </p>
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 700,
              color: "#0A0A0A",
              marginTop: 8,
            }}
          >
            Plan Your Dream Trip in 4 Steps
          </h2>
        </div>
        {[
          {
            step: "01",
            title: "Tell Us Your Dream",
            desc: "Share your destination, dates, dietary needs, and budget. Our AI listens to every detail.",
            img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
          },
          {
            step: "02",
            title: "AI Searches Everything",
            desc: "Knowledge graph finds halal restaurants near attractions. Weather, currency, and places — all checked.",
            img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
          },
          {
            step: "03",
            title: "Get Your Itinerary",
            desc: "A personalized day-by-day plan with costs in your currency, weather-optimized activities, and dietary-safe dining.",
            img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
          },
          {
            step: "04",
            title: "Travel & Enjoy",
            desc: "Save your plan, share with your group, track locations in real-time.",
            img: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
          },
        ].map((item, i) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              flexDirection: i % 2 === 0 ? "row" : "row-reverse",
              gap: 60,
              alignItems: "center",
              marginBottom: 80,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 300 }}>
              <Image
                src={item.img}
                alt={item.title}
                width={560}
                height={380}
                style={{
                  borderRadius: 20,
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <span
                style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: "#F0F0F0",
                  lineHeight: 1,
                }}
              >
                {item.step}
              </span>
              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginTop: -20,
                  marginBottom: 12,
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.65 }}>
                {item.desc}
              </p>
              <button
                onClick={() => router.push("/planner")}
                style={{
                  marginTop: 16,
                  color: "var(--orange)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                }}
              >
                Try it now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ═══ DESTINATIONS ═══ */}
      <section style={{ padding: "120px 24px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p className="section-label" style={{ color: "var(--orange)" }}>
              🌎 Explore
            </p>
            <h2
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 700,
                color: "#0A0A0A",
                marginTop: 8,
              }}
            >
              Where Will You Go Next?
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              overflowX: "auto",
              paddingBottom: 16,
            }}
            className="no-scrollbar"
          >
            {[
              {
                name: "Tokyo",
                country: "Japan",
                img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
              },
              {
                name: "Istanbul",
                country: "Turkey",
                img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
              },
              {
                name: "Paris",
                country: "France",
                img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
              },
              {
                name: "Dubai",
                country: "UAE",
                img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
              },
              {
                name: "Bali",
                country: "Indonesia",
                img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
              },
            ].map((d) => (
              <div
                key={d.name}
                onClick={() => router.push("/destinations")}
                className="card"
                style={{
                  minWidth: 300,
                  width: 300,
                  height: 440,
                  borderRadius: 24,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={d.img}
                  alt={d.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="300px"
                />
                <div style={{ position: "absolute", top: 16, left: 16 }}>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      padding: "6px 14px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {d.country}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "40px 20px 20px",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#FFF",
                      margin: 0,
                    }}
                  >
                    {d.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={() => router.push("/destinations")}
              className="btn-orange"
              style={{ padding: "14px 32px", fontSize: 15 }}
            >
              View All Destinations
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: "120px 24px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p className="section-label" style={{ color: "var(--orange)" }}>
              🎉 Features
            </p>
            <h2
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 700,
                color: "#0A0A0A",
                marginTop: 8,
              }}
            >
              What Makes TravelAI Special
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                title: "Knowledge Graph",
                desc: "Understands halal restaurants NEAR family attractions — not just keyword search.",
                img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
                tag: "AI",
              },
              {
                title: "Weather-Smart Plans",
                desc: "Indoor activities on rainy days, outdoor on sunny. Your itinerary adapts.",
                img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
                tag: "Smart",
              },
              {
                title: "Live Currency",
                desc: "All costs in your preferred currency with real-time exchange rates.",
                img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80",
                tag: "Finance",
              },
              {
                title: "Group Trips",
                desc: "Plan together with real-time location sharing and group chat.",
                img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&q=80",
                tag: "Social",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card"
                style={{ overflow: "hidden", cursor: "pointer" }}
              >
                <div style={{ height: 200, position: "relative" }}>
                  <Image
                    src={f.img}
                    alt={f.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="400px"
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "var(--orange-bg)",
                      color: "var(--orange)",
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <div style={{ padding: "20px 24px 24px" }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#0A0A0A",
                      marginBottom: 8,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6 }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI DEMO ═══ */}
      <section
        style={{
          padding: "120px 24px",
          background: "linear-gradient(135deg, #FFF8F0, #FFF3E0)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: 60,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 300 }}>
            <div
              style={{
                background: "#FFF",
                borderRadius: 24,
                boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
                padding: 24,
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "1px solid #F0F0F0",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageSquare size={18} color="#FFF" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                    TravelAI
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
                    Online
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "#F5F5F5",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "12px 16px",
                  marginBottom: 12,
                  maxWidth: "85%",
                }}
              >
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Hi! Where would you like to go? 🌍
                </p>
              </div>
              <div
                style={{
                  background: "var(--orange)",
                  borderRadius: 50,
                  padding: "8px 20px",
                  marginBottom: 12,
                  maxWidth: "75%",
                  marginLeft: "auto",
                  display: "inline-block",
                  float: "right",
                }}
              >
                <p style={{ fontSize: 13, color: "#FFF", margin: 0 }}>
                  3-day Istanbul trip, halal food
                </p>
              </div>
              <div style={{ clear: "both" }} />
              <div
                style={{
                  background: "#F5F5F5",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "12px 16px",
                  maxWidth: "90%",
                  marginTop: 12,
                }}
              >
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Here's your plan! Day 1: Hagia Sophia → Sultanahmet Koftecisi
                  (halal) → Blue Mosque...
                </p>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <p className="section-label" style={{ color: "var(--orange)" }}>
              🤖 AI Assistant
            </p>
            <h2
              style={{
                fontSize: "clamp(36px, 5vw, 48px)",
                fontWeight: 700,
                marginTop: 8,
                marginBottom: 24,
              }}
            >
              Plan in Seconds.
            </h2>
            {[
              "Personalized itineraries based on YOUR preferences",
              "Real-time weather, currency & halal restaurant data",
              "Remembers your conversations — gets smarter over time",
            ].map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Check size={14} color="#FFF" />
                </div>
                <p style={{ fontSize: 17, margin: 0, lineHeight: 1.5 }}>{b}</p>
              </div>
            ))}
            <button
              onClick={() => router.push("/planner")}
              className="btn-orange"
              style={{ padding: "16px 36px", fontSize: 16, marginTop: 16 }}
            >
              Try AI Chat — Free
            </button>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "120px 24px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p className="section-label" style={{ color: "var(--orange)" }}>
              💛 Reviews
            </p>
            <h2
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 700,
                marginTop: 8,
              }}
            >
              Loved by Travelers
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                name: "Ahmed Hassan",
                role: "Family Traveler",
                text: "TravelAI planned our Istanbul trip with halal restaurants near every attraction!",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
              },
              {
                name: "Sarah Chen",
                role: "Solo Explorer",
                text: "The AI remembered my preferences from last time and suggested even better options.",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
              },
              {
                name: "Maria Rodriguez",
                role: "Adventure Seeker",
                text: "Weather-aware itinerary was genius — moved outdoor activities to sunny days.",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="card"
                style={{ background: "#FFFBF0", padding: 32 }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#F7C948" color="#F7C948" />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: "#374151",
                    lineHeight: 1.65,
                    marginBottom: 24,
                  }}
                >
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                      {t.name}
                    </p>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          height: 400,
          overflow: "hidden",
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80"
          alt="Travel"
          fill
          style={{ objectFit: "cover" }}
          sizes="100vw"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 800,
                color: "#FFF",
                marginBottom: 12,
              }}
            >
              Take TravelAI With You
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.85)",
                marginBottom: 32,
              }}
            >
              Plan on the go, anywhere in the world
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn-orange"
                style={{ padding: "14px 32px", fontSize: 15 }}
                onClick={() => router.push("/planner")}
              >
                Start Free
              </button>
              <button
                className="btn-ghost"
                style={{ padding: "14px 32px", fontSize: 15 }}
                onClick={() => router.push("/about")}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
