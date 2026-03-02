import Image from "next/image";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/**
 * Destination card component
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Destination name
 * @param {string} props.description - Destination description
 * @param {string} props.image - Destination image URL
 * @param {string} props.slug - Destination slug for URL
 */
export default function DestinationCard({ name, description, image, slug }) {
  return (
    <Card hoverable padding="none" className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardBody>
        <h3 className="text-xl font-semibold mb-2 text-neutral-900">{name}</h3>
        <p className="text-neutral-600 mb-4">{description}</p>
        <Button variant="outline" size="sm">
          Explore
        </Button>
      </CardBody>
    </Card>
  );
}
