"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { tripsAPI, externalAPI } from "@/lib/api";
import {
  MapPin,
  Calendar,
  Cloud,
  DollarSign,
  ArrowLeft,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  Sun,
  CloudRain,
  Thermometer,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    fetchTrip();
  }, [id, isAuthenticated]);

  const fetchTrip = async () => {
    try {
      const { data } = await tripsAPI.getById(id);
      setTrip(data.data);
      // Fetch weather for destination
      try {
        const geo = await externalAPI.geocode(data.data.destination);
        if (geo.data.data) {
          const wx = await externalAPI.weather(
            geo.data.data.lat,
            geo.data.data.lng,
          );
          setWeather(wx.data.data);
        }
      } catch {}
    } catch {
      router.push("/trips");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this trip?")) return;
    await tripsAPI.delete(id);
    router.push("/trips");
  };

  if (loading)
    return (
      <Container className="py-16 text-center">
        <p className="text-neutral-500">Loading trip...</p>
      </Container>
    );

  if (!trip) return null;

  const statusColors = {
    draft: "bg-neutral-100 text-neutral-700",
    planned: "bg-primary-100 text-primary-700",
    active: "bg-success-100 text-success-700",
    completed: "bg-secondary-100 text-secondary-700",
  };

  return (
    <Container className="py-8">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/trips")}
          className="flex items-center text-neutral-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Trips
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Trip Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">{trip.title}</h1>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[trip.status] || statusColors.draft}`}
          >
            {trip.status}
          </span>
          {trip.aiGenerated && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Generated
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-neutral-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {trip.destination}
          </span>
          {trip.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(trip.startDate).toLocaleDateString()}
              {trip.endDate &&
                ` — ${new Date(trip.endDate).toLocaleDateString()}`}
            </span>
          )}
          {trip.budget?.total > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> {trip.budget.currency}{" "}
              {trip.budget.total}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itinerary */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Itinerary</h2>
          {trip.itinerary && trip.itinerary.length > 0 ? (
            <div className="space-y-4">
              {trip.itinerary.map((day, i) => (
                <Card key={i}>
                  <CardBody>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-neutral-900">
                        Day {day.day || i + 1}
                      </h3>
                      {day.weather && (
                        <span className="text-sm text-neutral-500 flex items-center gap-1">
                          <Thermometer className="w-3 h-3" /> {day.weather.temp}
                          ° — {day.weather.description}
                        </span>
                      )}
                    </div>
                    {day.activities && day.activities.length > 0 ? (
                      <div className="space-y-3">
                        {day.activities.map((act, j) => (
                          <div
                            key={j}
                            className="flex gap-3 pl-4 border-l-2 border-primary-200"
                          >
                            <div>
                              {act.time && (
                                <span className="text-xs font-medium text-primary-600">
                                  {act.time}
                                </span>
                              )}
                              <p className="font-medium text-neutral-800">
                                {act.name}
                              </p>
                              {act.description && (
                                <p className="text-sm text-neutral-600">
                                  {act.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-1">
                                {act.cost?.amount > 0 && (
                                  <span className="text-xs text-neutral-500">
                                    {act.cost.currency} {act.cost.amount}
                                  </span>
                                )}
                                {act.tags?.map((tag, k) => (
                                  <span
                                    key={k}
                                    className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full text-neutral-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">
                        No activities planned for this day
                      </p>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-8">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">
                  No itinerary yet. Use AI Chat to generate one!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push("/chat")}
                >
                  Generate with AI
                </Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar — Weather + Info */}
        <div className="space-y-6">
          {weather && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Cloud className="w-4 h-4" /> Current Weather
                </h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-neutral-900">
                    {Math.round(weather.temp)}°
                  </p>
                  <p className="text-neutral-600 capitalize">
                    {weather.description}
                  </p>
                  <div className="flex justify-center gap-4 mt-3 text-sm text-neutral-500">
                    <span>Humidity: {weather.humidity}%</span>
                    <span>Wind: {weather.windSpeed} m/s</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody>
              <h3 className="font-semibold text-neutral-900 mb-3">
                Trip Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span className="font-medium capitalize">{trip.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Destination</span>
                  <span className="font-medium">{trip.destination}</span>
                </div>
                {trip.budget?.total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Budget</span>
                    <span className="font-medium">
                      {trip.budget.currency} {trip.budget.total}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created</span>
                  <span className="font-medium">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
