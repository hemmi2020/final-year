"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  MessageSquare,
  Settings,
  Plus,
  Clock,
  Globe,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { tripsAPI } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    // Fetch real trips from API
    tripsAPI
      .getAll()
      .then(({ data }) => setTrips(data.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

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

  const stats = [
    {
      label: "Trips Planned",
      value: String(trips.length),
      icon: MapPin,
      color: "primary",
    },
    {
      label: "Completed",
      value: String(trips.filter((t) => t.status === "completed").length),
      icon: Globe,
      color: "secondary",
    },
    {
      label: "AI Generated",
      value: String(trips.filter((t) => t.aiGenerated).length),
      icon: Heart,
      color: "accent",
    },
    {
      label: "Active",
      value: String(trips.filter((t) => t.status === "active").length),
      icon: TrendingUp,
      color: "success",
    },
  ];

  const recentTrips = trips.slice(0, 3);

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-[#6B7280]">
            Here's what's happening with your travels
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" onClick={() => router.push("/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="primary" onClick={() => router.push("/chat")}>
            <Plus className="w-4 h-4 mr-2" />
            Plan New Trip
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} variant="elevated" padding="lg">
            <CardBody className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#0A0A0A]">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0A0A0A]">
              Recent Trips
            </h2>
            <Button variant="ghost" onClick={() => router.push("/trips")}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-[#9CA3AF] text-center py-8">
                Loading trips...
              </p>
            ) : recentTrips.length === 0 ? (
              <Card padding="lg">
                <CardBody className="text-center py-8">
                  <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-[#6B7280] mb-4">
                    No trips yet. Start planning your first adventure!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/chat")}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Plan a Trip with AI
                  </Button>
                </CardBody>
              </Card>
            ) : (
              recentTrips.map((trip) => (
                <Card
                  key={trip._id}
                  hoverable
                  padding="none"
                  className="overflow-hidden"
                >
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0A0A0A] mb-1">
                          {trip.title}
                        </h3>
                        <div className="flex items-center text-sm text-[#6B7280] mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              trip.status === "active"
                                ? "bg-[#E8F5E9] text-[#22C55E]"
                                : trip.status === "planned"
                                  ? "bg-[#FFF5F0] text-[#FF4500]"
                                  : "bg-[#F5F5F5] text-[#374151]"
                            }`}
                          >
                            {trip.status}
                          </span>
                          {trip.aiGenerated && (
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-[#FFF3E0] text-[#F59E0B]">
                              AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/trips/${trip._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/chat")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#FF4500] hover:bg-[#FFF5F0] transition-colors"
            >
              <div className="w-10 h-10 bg-[#FFF5F0] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#FF4500]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#0A0A0A]">Start AI Chat</p>
                <p className="text-sm text-[#6B7280]">
                  Plan your next adventure
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push("/destinations")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#0284C7] hover:bg-[#E0F2FE] transition-colors"
            >
              <div className="w-10 h-10 bg-[#E0F2FE] rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#0A0A0A]">
                  Explore Destinations
                </p>
                <p className="text-sm text-[#6B7280]">Discover new places</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/trips")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#F59E0B] hover:bg-[#FFF3E0] transition-colors"
            >
              <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#0A0A0A]">My Trips</p>
                <p className="text-sm text-[#6B7280]">View all itineraries</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#D1D5DB] hover:bg-[#FAF9F7] transition-colors"
            >
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#0A0A0A]">Settings</p>
                <p className="text-sm text-[#6B7280]">Manage your account</p>
              </div>
            </button>
          </div>

          {/* Travel Tips */}
          <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#FF4500]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0A0A0A] mb-2">
                  Travel Tip
                </h3>
                <p className="text-sm text-[#374151]">
                  Book flights 6-8 weeks in advance for the best deals! Our AI
                  can help you find the perfect timing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
