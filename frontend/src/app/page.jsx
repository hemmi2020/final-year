import Hero from "@/components/features/Hero";
import FeaturesSection from "@/components/features/FeaturesSection";
import PipelineSection from "@/components/features/PipelineSection";
import DestinationsSection from "@/components/features/DestinationsSection";
import QuizSection from "@/components/features/QuizSection";
import TestimonialsSection from "@/components/features/TestimonialsSection";

const destinations = [
  {
    id: 1,
    name: "Paris, France",
    description:
      "The City of Light awaits with iconic landmarks, world-class museums, and romantic atmosphere.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  },
  {
    id: 2,
    name: "Tokyo, Japan",
    description:
      "Experience the perfect blend of ancient traditions and cutting-edge technology.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  },
  {
    id: 3,
    name: "Bali, Indonesia",
    description:
      "Discover tropical paradise with stunning beaches, lush rice terraces, and rich culture.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  },
  {
    id: 4,
    name: "Istanbul, Turkey",
    description:
      "Where East meets West — ancient mosques, vibrant bazaars, and incredible halal cuisine.",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
  },
  {
    id: 5,
    name: "Dubai, UAE",
    description:
      "Marvel at futuristic architecture, luxury shopping, and desert adventures.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  },
  {
    id: 6,
    name: "New York, USA",
    description:
      "The city that never sleeps offers endless entertainment, diverse culture, and iconic landmarks.",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  },
];

const testimonials = [
  {
    id: 1,
    text: "TravelAI planned our entire family trip to Istanbul with halal restaurants near every attraction. The AI knew exactly what we needed!",
    author: "Ahmed Hassan",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    role: "Family Traveler",
  },
  {
    id: 2,
    text: "As a solo traveler, I was amazed how the AI remembered my preferences from our last chat and suggested even better options this time.",
    author: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    role: "Solo Explorer",
  },
  {
    id: 3,
    text: "The weather-aware itinerary was genius — it moved our outdoor activities to sunny days and suggested museums for the rainy ones.",
    author: "Maria Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    role: "Adventure Seeker",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturesSection />
      <PipelineSection />
      <DestinationsSection destinations={destinations} />
      <QuizSection />
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
}
