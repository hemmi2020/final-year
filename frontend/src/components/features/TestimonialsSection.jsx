"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import Container from "@/components/layout/Container";

export default function TestimonialsSection({ testimonials }) {
  return (
    <section className="py-20 bg-neutral-50">
      <Container>
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Loved by Travelers
          </h2>
          <p className="text-lg text-neutral-600">
            See what our users say about their AI-planned trips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent-400 text-accent-400"
                  />
                ))}
              </div>

              <p className="text-neutral-700 mb-6 leading-relaxed text-sm">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={t.avatar}
                    alt={t.author}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">
                    {t.author}
                  </p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
