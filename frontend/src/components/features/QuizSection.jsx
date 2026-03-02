import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

/**
 * Quiz section component
 */
export default function QuizSection() {
  const travelStyles = [
    { emoji: "🏖️", label: "Relaxation" },
    { emoji: "🏔️", label: "Adventure" },
    { emoji: "🏛️", label: "Culture" },
    { emoji: "🍽️", label: "Culinary" },
  ];

  return (
    <section className="py-16 md:py-24 bg-primary-50">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
            Find Your Travel Style
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Take our quick 5-minute quiz to discover destinations and
            experiences perfectly matched to your preferences
          </p>

          {/* Travel style icons */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8">
            {travelStyles.map((style) => (
              <div key={style.label} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md text-3xl">
                  {style.emoji}
                </div>
                <span className="text-sm text-neutral-600">{style.label}</span>
              </div>
            ))}
          </div>

          <Button variant="primary" size="lg">
            Start the Quiz
          </Button>
        </div>
      </Container>
    </section>
  );
}
