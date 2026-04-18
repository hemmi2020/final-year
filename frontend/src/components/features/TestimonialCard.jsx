import Image from "next/image";
import Card, { CardBody } from "@/components/ui/Card";

/**
 * Testimonial card component
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Testimonial text
 * @param {string} props.author - Author name
 * @param {string} props.avatar - Author avatar URL
 * @param {string} props.role - Author role (optional)
 */
export default function TestimonialCard({ text, author, avatar, role }) {
  return (
    <Card padding="lg">
      <CardBody className="p-0">
        <div className="flex items-center mb-4">
          <div
            className="relative overflow-hidden shrink-0"
            style={{ width: 56, height: 56, borderRadius: "50%" }}
          >
            <Image
              src={avatar}
              alt={author}
              fill
              className="object-cover object-center"
              sizes="56px"
            />
          </div>
          <div className="ml-3">
            <p className="font-semibold text-neutral-900">{author}</p>
            {role && <p className="text-sm text-neutral-600">{role}</p>}
          </div>
        </div>
        <p className="text-neutral-700 italic">"{text}"</p>
      </CardBody>
    </Card>
  );
}
