import Hero from "@/components/features/Hero";
import DestinationsSection from "@/components/features/DestinationsSection";
import QuizSection from "@/components/features/QuizSection";
import TestimonialsSection from "@/components/features/TestimonialsSection";

// Sample destinations data
const destinations = [
  {
    id: 1,
    name: "Paris, France",
    description:
      "The City of Light awaits with its iconic landmarks, world-class museums, and romantic atmosphere.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    slug: "paris-france",
  },
  {
    id: 2,
    name: "Tokyo, Japan",
    description:
      "Experience the perfect blend of ancient traditions and cutting-edge technology in this vibrant metropolis.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    slug: "tokyo-japan",
  },
  {
    id: 3,
    name: "Bali, Indonesia",
    description:
      "Discover tropical paradise with stunning beaches, lush rice terraces, and rich cultural heritage.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    slug: "bali-indonesia",
  },
  {
    id: 4,
    name: "Rome, Italy",
    description:
      "Walk through history in the Eternal City, home to ancient ruins, Renaissance art, and incredible cuisine.",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    slug: "rome-italy",
  },
  {
    id: 5,
    name: "Dubai, UAE",
    description:
      "Marvel at futuristic architecture, luxury shopping, and desert adventures in this modern oasis.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    slug: "dubai-uae",
  },
  {
    id: 6,
    name: "New York, USA",
    description:
      "The city that never sleeps offers endless entertainment, diverse culture, and iconic landmarks.",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    slug: "new-york-usa",
  },
];

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    text: "TravelAI helped me plan the perfect honeymoon to Bali. Every detail was thoughtfully curated to match our preferences!",
    author: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    role: "Newlywed Traveler",
  },
  {
    id: 2,
    text: "As a solo traveler, I was nervous about planning my first international trip. TravelAI made it so easy and stress-free!",
    author: "Michael Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    role: "Solo Adventurer",
  },
  {
    id: 3,
    text: "The AI recommendations were spot-on! We discovered hidden gems we would have never found on our own.",
    author: "Emily Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    role: "Family Vacation Planner",
  },
];

export default function Home() {
  return (
    <div className="animate-in fade-in duration-500">
      <Hero />
      <DestinationsSection destinations={destinations} />
      <QuizSection />
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
}
