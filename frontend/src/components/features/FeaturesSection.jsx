"use client";

import {
  Brain,
  MapPin,
  Cloud,
  DollarSign,
  Users,
  Shield,
  Utensils,
  Zap,
} from "lucide-react";
import Container from "@/components/layout/Container";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Planning",
    description:
      "GPT-4o-mini generates personalized day-by-day itineraries based on your preferences",
    color: "primary",
  },
  {
    icon: MapPin,
    title: "Knowledge Graph",
    description:
      "Neo4j understands relationships — halal restaurants NEAR family-friendly attractions",
    color: "secondary",
  },
  {
    icon: Cloud,
    title: "Real-Time Weather",
    description:
      "Itineraries adapt to weather — indoor activities on rainy days, outdoor on sunny",
    color: "primary",
  },
  {
    icon: DollarSign,
    title: "Currency Conversion",
    description:
      "All costs shown in your preferred currency with live exchange rates",
    color: "accent",
  },
  {
    icon: Utensils,
    title: "Dietary Aware",
    description:
      "Halal, vegan, vegetarian — every restaurant recommendation respects your diet",
    color: "secondary",
  },
  {
    icon: Zap,
    title: "Memory & Learning",
    description:
      "Redis-powered memory remembers your conversations and improves over time",
    color: "primary",
  },
  {
    icon: Users,
    title: "Group Trips",
    description: "Plan together with real-time location sharing and group chat",
    color: "secondary",
  },
  {
    icon: Shield,
    title: "Preference Engine",
    description:
      "Set once, personalized everywhere — budget, style, interests drive every result",
    color: "accent",
  },
];

const colorMap = {
  primary: {
    bg: "bg-primary-50",
    icon: "text-primary-600",
    border: "border-primary-100",
  },
  secondary: {
    bg: "bg-secondary-50",
    icon: "text-secondary-600",
    border: "border-secondary-100",
  },
  accent: {
    bg: "bg-accent-50",
    icon: "text-accent-600",
    border: "border-accent-100",
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <Container>
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Not Just a Chatbot — An Intelligent System
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our AI agent orchestrates multiple data sources to create truly
            personalized travel experiences
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={`group p-6 bg-white rounded-2xl border ${colors.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
