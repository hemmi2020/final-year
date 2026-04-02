"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

export default function QuizSection() {
  const router = useRouter();

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #0d9488 100%)",
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-white">
              5 Quick Questions
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            What's Your Travel Style?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Take our 1-minute quiz and let AI personalize every recommendation —
            from restaurants to attractions to weather preferences
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push("/quiz")}
              style={{ backgroundColor: "#ffffff", color: "#1d4ed8" }}
              className="inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-base shadow-lg hover:opacity-90 transition-opacity"
            >
              Take the Quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <p className="text-sm text-white/60">No account needed to start</p>
          </div>

          {/* Preview tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            {[
              "Solo",
              "Family",
              "Halal",
              "Budget",
              "Adventure",
              "Culture",
              "Luxury",
              "Vegan",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium text-white/70 bg-white/10 rounded-full border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
