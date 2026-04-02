"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

const steps = [
  {
    step: "1",
    title: "You Say",
    example: '"3-day Tokyo trip with halal food"',
    color: "primary",
  },
  {
    step: "2",
    title: "AI Loads",
    example: "Your preferences + memory + past trips",
    color: "secondary",
  },
  {
    step: "3",
    title: "Graph Searches",
    example: "Halal restaurants NEAR family attractions",
    color: "primary",
  },
  {
    step: "4",
    title: "Real-Time Data",
    example: "Weather, currency rates, nearby places",
    color: "accent",
  },
  {
    step: "5",
    title: "AI Generates",
    example: "Personalized day-by-day itinerary",
    color: "secondary",
  },
  {
    step: "6",
    title: "You Get",
    example: "Complete plan in your currency & language",
    color: "primary",
  },
];

const colorMap = {
  primary: "bg-primary-600",
  secondary: "bg-secondary-600",
  accent: "bg-accent-600",
};

export default function PipelineSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-sm font-medium text-secondary-700 bg-secondary-100 rounded-full mb-4">
            The Magic
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            From Question to Itinerary in Seconds
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our AI agent pipeline combines 6 data sources to create the perfect
            plan
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              <div
                className={`w-10 h-10 ${colorMap[s.color]} text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold`}
              >
                {s.step}
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                {s.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {s.example}
              </p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-5 -right-2 w-4 h-4 text-neutral-300" />
              )}
            </div>
          ))}
        </div>

        {/* Example Result */}
        <div className="max-w-2xl mx-auto bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="bg-primary-600 text-white rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
              Plan a 3-day Tokyo trip with halal food for my family
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-neutral-700 border border-neutral-200 space-y-2">
              <p className="font-medium text-neutral-900">
                Here's your personalized itinerary:
              </p>
              <p>
                Day 1 (Sunny, 22°C): Senso-ji Temple → Naritakaya Halal Ramen →
                TeamLab Borderless
              </p>
              <p>
                Day 2 (Rainy, 18°C): Tokyo National Museum → Gyumon Halal
                Yakiniku → Akihabara
              </p>
              <p>Day 3 (Cloudy, 20°C): Meiji Shrine → Harajuku → Tokyo Tower</p>
              <p className="text-xs text-neutral-500">
                Total: PKR 125,000 (¥65,000 at today's rate) · All restaurants
                halal-certified
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/chat")}
          >
            Try It Now — Free
          </Button>
        </div>
      </Container>
    </section>
  );
}
