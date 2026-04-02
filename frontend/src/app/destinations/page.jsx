"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { externalAPI } from "@/lib/api";
import {
  Search,
  MapPin,
  Cloud,
  Thermometer,
  Utensils,
  Landmark,
  Loader2,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";

const POPULAR = [
  { name: "Tokyo", country: "Japan", emoji: "🇯🇵" },
  { name: "Istanbul", country: "Turkey", emoji: "🇹🇷" },
  { name: "Paris", country: "France", emoji: "🇫🇷" },
  { name: "Dubai", country: "UAE", emoji: "🇦🇪" },
  { name: "London", country: "UK", emoji: "🇬🇧" },
  { name: "New York", country: "USA", emoji: "🇺🇸" },
  { name: "Bangkok", country: "Thailand", emoji: "🇹🇭" },
  { name: "Rome", country: "Italy", emoji: "🇮🇹" },
];

export default function DestinationsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [attractions, setAttractions] = useState([]);

  const searchDestination = async (name) => {
    setLoading(true);
    setResult(null);
    setWeather(null);
    setRestaurants([]);
    setAttractions([]);
    try {
      const geo = await externalAPI.geocode(name);
      if (!geo.data.data) {
        setLoading(false);
        return;
      }
      const loc = geo.data.data;
      setResult(loc);

      // Fetch weather, restaurants, attractions in parallel
      const [wx, rest, attr] = await Promise.allSettled([
        externalAPI.weather(loc.lat, loc.lng),
        externalAPI.places(name, loc.lat, loc.lng, "restaurant"),
        externalAPI.attractions(loc.lat, loc.lng),
      ]);
      if (wx.status === "fulfilled") setWeather(wx.value.data.data);
      if (rest.status === "fulfilled")
        setRestaurants(rest.value.data.data?.slice(0, 6) || []);
      if (attr.status === "fulfilled")
        setAttractions(attr.value.data.data?.slice(0, 6) || []);
    } catch {}
    setLoading(false);
  };

  return (
    <Container className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Explore Destinations
        </h1>
        <p className="text-neutral-600">
          Search any city to see weather, restaurants, and attractions
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                query.trim() &&
                searchDestination(query.trim())
              }
              placeholder="Search a city... (e.g. Tokyo, Istanbul, Paris)"
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => query.trim() && searchDestination(query.trim())}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {/* Popular Destinations */}
      {!result && !loading && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POPULAR.map((dest) => (
              <button
                key={dest.name}
                onClick={() => {
                  setQuery(dest.name);
                  searchDestination(dest.name);
                }}
                className="p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <span className="text-2xl">{dest.emoji}</span>
                <p className="font-medium text-neutral-900 mt-1">{dest.name}</p>
                <p className="text-xs text-neutral-500">{dest.country}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-neutral-500">Fetching destination data...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {result.displayName}
              </h2>
              <p className="text-sm text-neutral-500">
                Lat: {result.lat.toFixed(4)}, Lng: {result.lng.toFixed(4)}
              </p>
            </div>
            <Button variant="primary" onClick={() => router.push(`/chat`)}>
              Plan a Trip Here
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather */}
            {weather && (
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4" /> Current Weather
                  </h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-neutral-900">
                      {Math.round(weather.temp)}°C
                    </p>
                    <p className="text-neutral-600 capitalize">
                      {weather.description}
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-neutral-500">
                      <span>Feels like {Math.round(weather.feelsLike)}°</span>
                      <span>Humidity {weather.humidity}%</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Restaurants */}
            <Card>
              <CardBody>
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4" /> Restaurants
                </h3>
                {restaurants.length > 0 ? (
                  <div className="space-y-2">
                    {restaurants.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-800">
                            {r.name}
                          </p>
                          {r.cuisine && (
                            <p className="text-xs text-neutral-500">
                              {r.cuisine}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {r.dietary?.halal && (
                            <span className="text-xs px-1.5 py-0.5 bg-success-50 text-success-700 rounded">
                              halal
                            </span>
                          )}
                          {r.dietary?.vegan && (
                            <span className="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded">
                              vegan
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No restaurants found nearby
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Attractions */}
            <Card>
              <CardBody>
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> Attractions
                </h3>
                {attractions.length > 0 ? (
                  <div className="space-y-2">
                    {attractions.map((a, i) => (
                      <div
                        key={i}
                        className="py-1.5 border-b border-neutral-100 last:border-0"
                      >
                        <p className="text-sm font-medium text-neutral-800">
                          {a.name}
                        </p>
                        <p className="text-xs text-neutral-500 capitalize">
                          {a.type}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No attractions found nearby
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}
