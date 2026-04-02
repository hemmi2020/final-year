"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, MessageSquare, Globe, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Beautiful travel destination"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/25 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-primary-400/20 rounded-full animate-pulse delay-500" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center text-white">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium">
            Powered by AI + Knowledge Graph
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
          Discover Your
          <span className="block bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
            Perfect Journey
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white/80 leading-relaxed">
          AI-powered travel planning that understands your dietary needs,
          budget, and style — personalized itineraries in seconds
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/chat")}
            className="text-base px-8 py-4 shadow-lg shadow-primary-500/25"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start Planning with AI
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/destinations")}
            className="text-base px-8 py-4 border-white/30 text-white hover:bg-white/10"
          >
            <Globe className="w-5 h-5 mr-2" />
            Explore Destinations
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">50+</p>
            <p className="text-xs sm:text-sm text-white/60">Destinations</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-2xl sm:text-3xl font-bold text-white">AI</p>
            <p className="text-xs sm:text-sm text-white/60">Powered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">24/7</p>
            <p className="text-xs sm:text-sm text-white/60">Chat Support</p>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
