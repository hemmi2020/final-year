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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    }
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
    { label: "Trips Planned", value: "12", icon: MapPin, color: "primary" },
    { label: "Countries Visited", value: "8", icon: Globe, color: "secondary" },
    { label: "Saved Places", value: "45", icon: Heart, color: "accent" },
    {
      label: "Chat Sessions",
      value: "28",
      icon: MessageSquare,
      color: "success",
    },
  ];

  const recentTrips = [
    {
      id: 1,
      destination: "Paris, France",
      dates: "Mar 15 - Mar 22, 2026",
      status: "Upcoming",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
    },
    {
      id: 2,
      destination: "Tokyo, Japan",
      dates: "Feb 10 - Feb 18, 2026",
      status: "Completed",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
    },
  ];

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-neutral-600">
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
                  <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-neutral-900">
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
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Trips
            </h2>
            <Button variant="ghost" onClick={() => router.push("/trips")}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <Card
                key={trip.id}
                hoverable
                padding="none"
                className="overflow-hidden"
              >
                <div className="flex">
                  <div className="w-32 h-32 relative flex-shrink-0">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardBody className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          {trip.destination}
                        </h3>
                        <div className="flex items-center text-sm text-neutral-600 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {trip.dates}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            trip.status === "Upcoming"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardBody>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/chat")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900">Start AI Chat</p>
                <p className="text-sm text-neutral-600">
                  Plan your next adventure
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push("/destinations")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-secondary-300 hover:bg-secondary-50 transition-colors"
            >
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-secondary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900">
                  Explore Destinations
                </p>
                <p className="text-sm text-neutral-600">Discover new places</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/trips")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-accent-300 hover:bg-accent-50 transition-colors"
            >
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900">My Trips</p>
                <p className="text-sm text-neutral-600">View all itineraries</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900">Settings</p>
                <p className="text-sm text-neutral-600">Manage your account</p>
              </div>
            </button>
          </div>

          {/* Travel Tips */}
          <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Travel Tip
                </h3>
                <p className="text-sm text-neutral-700">
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
