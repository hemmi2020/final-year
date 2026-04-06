"use client";

import { useRouter } from "next/navigation";
import {
  Brain,
  MapPin,
  Cloud,
  DollarSign,
  Utensils,
  Zap,
  Users,
  Shield,
  Github,
  Linkedin,
  Mail,
  MessageSquare,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";

const techStack = [
  { name: "Next.js 16", category: "Frontend", icon: "⚡" },
  { name: "Tailwind CSS v4", category: "Styling", icon: "🎨" },
  { name: "Node.js + Express 5", category: "Backend", icon: "🖥️" },
  { name: "MongoDB Atlas", category: "Database", icon: "🗄️" },
  { name: "Neo4j Aura", category: "Knowledge Graph", icon: "🕸️" },
  { name: "Pinecone", category: "Vector Store", icon: "📌" },
  { name: "Redis (Upstash)", category: "Memory", icon: "🧠" },
  { name: "OpenAI GPT-4o-mini", category: "AI Engine", icon: "🤖" },
  { name: "Socket.io", category: "Real-Time", icon: "🔌" },
  { name: "OpenWeatherMap", category: "Weather API", icon: "🌤️" },
  { name: "ExchangeRate-API", category: "Currency", icon: "💱" },
  { name: "OpenStreetMap", category: "Maps & Places", icon: "🗺️" },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Itineraries",
    desc: "GPT-4o-mini generates personalized day-by-day travel plans based on your preferences",
  },
  {
    icon: MapPin,
    title: "Graph RAG (Neo4j)",
    desc: "Knowledge Graph understands relationships — halal restaurants NEAR family-friendly attractions",
  },
  {
    icon: Cloud,
    title: "Weather-Aware Planning",
    desc: "Real-time weather data optimizes your itinerary — indoor activities on rainy days",
  },
  {
    icon: DollarSign,
    title: "Live Currency Conversion",
    desc: "All costs shown in your preferred currency with real-time exchange rates",
  },
  {
    icon: Utensils,
    title: "Dietary Preferences",
    desc: "Halal, vegan, vegetarian — every recommendation respects your dietary needs",
  },
  {
    icon: Zap,
    title: "Conversation Memory",
    desc: "Redis-powered memory remembers your chats and improves recommendations over time",
  },
  {
    icon: Users,
    title: "Group Trips",
    desc: "Plan together with real-time location sharing and group chat via Socket.io",
  },
  {
    icon: Shield,
    title: "Preference Engine",
    desc: "Set once, personalized everywhere — budget, style, interests drive every result",
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div>
      {/* Hero */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        }}
      >
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold mb-6"
              style={{ color: "#ffffff" }}
            >
              About TravelFy AI
            </h1>
            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: "#94a3b8" }}
            >
              TravelFy AI is an intelligent travel planning platform that
              combines AI agents, knowledge graphs, and real-time data to create
              truly personalized travel experiences. Built as a Final Year
              Project demonstrating advanced full-stack development with
              cutting-edge AI architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={() => router.push("/chat")}>
                <MessageSquare className="w-4 h-4 mr-2" /> Try AI Chat
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/destinations")}
                className="border-white/30"
                style={{ color: "#ffffff" }}
              >
                Explore Destinations
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-neutral-50">
        <Container>
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            Our AI agent orchestrates multiple data sources in a single pipeline
            to deliver personalized results
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <Card
                key={f.title}
                className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <CardBody>
                  <f.icon className="w-8 h-8 text-primary-600 mb-3" />
                  <h3 className="font-semibold text-neutral-900 mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {f.desc}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-white">
        <Container>
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">
            Tech Stack
          </h2>
          <p className="text-neutral-600 text-center mb-12">
            The technologies powering TravelFy AI
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors"
              >
                <span className="text-2xl">{tech.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {tech.name}
                  </p>
                  <p className="text-xs text-neutral-500">{tech.category}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Architecture */}
      <section className="py-16 bg-neutral-50">
        <Container>
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">
            Architecture
          </h2>
          <p className="text-neutral-600 text-center mb-10">
            AI Agent Pipeline — from user query to personalized itinerary
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  label: "User sends query",
                  detail: '"3-day Tokyo trip with halal food"',
                  color: "#2563eb",
                },
                {
                  step: "2",
                  label: "Load preferences + memory",
                  detail: "MongoDB user prefs + Redis conversation history",
                  color: "#0d9488",
                },
                {
                  step: "3",
                  label: "Graph RAG search",
                  detail: "Neo4j: halal restaurants NEAR family attractions",
                  color: "#2563eb",
                },
                {
                  step: "4",
                  label: "Vector semantic search",
                  detail: "Pinecone: similar travel content & recommendations",
                  color: "#0d9488",
                },
                {
                  step: "5",
                  label: "Real-time data",
                  detail: "Weather + Currency + Places APIs (preference-aware)",
                  color: "#d97706",
                },
                {
                  step: "6",
                  label: "AI generates itinerary",
                  detail:
                    "GPT-4o-mini combines all context into personalized plan",
                  color: "#2563eb",
                },
                {
                  step: "7",
                  label: "Save to memory + respond",
                  detail:
                    "Redis stores conversation, user gets complete itinerary",
                  color: "#0d9488",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{s.label}</p>
                    <p className="text-sm text-neutral-500">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Ready to Plan Your Trip?
            </h2>
            <p className="text-neutral-600 mb-8">
              Start chatting with our AI — no login required. Save your plans
              when you're ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/chat")}
              >
                <MessageSquare className="w-5 h-5 mr-2" /> Start AI Chat
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/planner")}
              >
                Plan a Trip
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
