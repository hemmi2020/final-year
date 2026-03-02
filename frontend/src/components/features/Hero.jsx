import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

/**
 * Hero section component for landing page
 */
export default function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Discover Your Perfect Journey
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          AI-powered travel planning tailored to your unique style and
          preferences
        </p>
        <Button
          variant="primary"
          size="lg"
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
        >
          Start Planning Your Trip
        </Button>
      </Container>
    </section>
  );
}
