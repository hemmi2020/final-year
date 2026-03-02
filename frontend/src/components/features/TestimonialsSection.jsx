import Container from '@/components/layout/Container';
import TestimonialCard from './TestimonialCard';

/**
 * Testimonials section component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.testimonials - Array of testimonial objects
 */
export default function TestimonialsSection({ testimonials }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
            What Travelers Say
          </h2>
          <p className="text-lg text-neutral-600">
            Join thousands of happy travelers who've discovered their perfect journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}
