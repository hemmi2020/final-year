"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { tripsAPI } from "@/lib/api";
import { MapPin, Calendar, Plus, Trash2, Sparkles } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function TripsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    tripsAPI
      .getAll()
      .then(({ data }) => setTrips(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await tripsAPI.delete(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => router.push("/")}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => router.push("/")}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Trips</h1>
          <p className="text-neutral-600 mt-1">All your planned adventures</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/chat")}>
          <Plus className="w-4 h-4 mr-2" /> Plan New Trip
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-neutral-500 py-12">Loading...</p>
      ) : trips.length === 0 ? (
        <Card padding="lg">
          <CardBody className="text-center py-16">
            <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">
              No trips yet
            </h3>
            <p className="text-neutral-500 mb-6">
              Chat with our AI to plan your first trip!
            </p>
            <Button variant="primary" onClick={() => router.push("/chat")}>
              <Sparkles className="w-4 h-4 mr-2" /> Start Planning
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip._id}
              hoverable
              padding="none"
              className="overflow-hidden"
            >
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {trip.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    className="text-neutral-400 hover:text-error-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center text-sm text-neutral-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" /> {trip.destination}
                </div>
                {trip.startDate && (
                  <div className="flex items-center text-sm text-neutral-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(trip.startDate).toLocaleDateString()}
                    {trip.endDate &&
                      ` — ${new Date(trip.endDate).toLocaleDateString()}`}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      trip.status === "active"
                        ? "bg-success-100 text-success-700"
                        : trip.status === "planned"
                          ? "bg-primary-100 text-primary-700"
                          : trip.status === "completed"
                            ? "bg-neutral-100 text-neutral-700"
                            : "bg-accent-100 text-accent-700"
                    }`}
                  >
                    {trip.status}
                  </span>
                  {trip.aiGenerated && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-700">
                      AI
                    </span>
                  )}
                  {trip.budget?.total > 0 && (
                    <span className="text-xs text-neutral-500">
                      {trip.budget.currency} {trip.budget.total}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => router.push(`/trips/${trip._id}`)}
                >
                  View Details
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
