import Container from "@/components/layout/Container";
import DestinationCard from "./DestinationCard";

/**
 * Destinations section component
 *
 * @param {Object} props - Component props
 * @param {Array} props.destinations - Array of destination objects
 */
export default function DestinationsSection({ destinations }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
            Popular Destinations
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Explore our most loved destinations and start planning your next
            adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <DestinationCard {...destination} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
