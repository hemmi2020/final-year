"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

export default function DestinationsSection({ destinations }) {
  const router = useRouter();

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block px-3 py-1 text-sm font-medium text-accent-700 bg-accent-100 rounded-full mb-4">
              Popular Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Where Will You Go Next?
            </h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/destinations")}
            className="hidden sm:flex"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((dest) => (
            <div
              key={dest.id}
              onClick={() => router.push("/destinations")}
              className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
                  {dest.name}
                </h3>
                <p className="text-sm text-white/70 line-clamp-2">
                  {dest.description}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button
            variant="outline"
            onClick={() => router.push("/destinations")}
          >
            View All Destinations
          </Button>
        </div>
      </Container>
    </section>
  );
}
