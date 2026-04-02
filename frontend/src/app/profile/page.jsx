"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usersAPI, tripsAPI } from "@/lib/api";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Settings,
  Sparkles,
  Utensils,
  Wallet,
  Globe,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    Promise.all([
      usersAPI.getProfile().then(({ data }) => setProfile(data.data)),
      tripsAPI.getAll().then(({ data }) => setTrips(data.data || [])),
    ])
      .catch(() => {})
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

  if (loading)
    return (
      <Container className="py-16 text-center">
        <p className="text-neutral-500">Loading...</p>
      </Container>
    );

  const prefs = profile?.preferences || {};

  return (
    <Container className="py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {profile?.name}
            </h1>
            <p className="text-neutral-600 flex items-center gap-1">
              <Mail className="w-4 h-4" /> {profile?.email}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              Member since {new Date(profile?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push("/settings")}>
          <Settings className="w-4 h-4 mr-2" /> Edit Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferences Card */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Travel Preferences
            </h2>
            <div className="space-y-3">
              {prefs.dietary?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Utensils className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Dietary</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prefs.dietary.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Budget</p>
                  <p className="text-sm font-medium capitalize">
                    {prefs.budget || "moderate"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Currency / Temp</p>
                  <p className="text-sm font-medium">
                    {prefs.preferredCurrency || "USD"} ·{" "}
                    {prefs.temperatureUnit === "imperial" ? "°F" : "°C"}
                  </p>
                </div>
              </div>
              {prefs.interests?.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {prefs.interests.map((i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-secondary-50 text-secondary-700 rounded-full capitalize"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Travel Style</p>
                  <p className="text-sm font-medium capitalize">
                    {prefs.travelStyle || "solo"}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Trip Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-700">
                  {trips.length}
                </p>
                <p className="text-sm text-primary-600">Total Trips</p>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-2xl font-bold text-success-700">
                  {trips.filter((t) => t.status === "completed").length}
                </p>
                <p className="text-sm text-success-600">Completed</p>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-lg">
                <p className="text-2xl font-bold text-accent-700">
                  {trips.filter((t) => t.aiGenerated).length}
                </p>
                <p className="text-sm text-accent-600">AI Generated</p>
              </div>
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <p className="text-2xl font-bold text-secondary-700">
                  {trips.filter((t) => t.status === "active").length}
                </p>
                <p className="text-sm text-secondary-600">Active</p>
              </div>
            </div>

            {/* Recent Trips */}
            {trips.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">
                  Recent Trips
                </h3>
                <div className="space-y-2">
                  {trips.slice(0, 3).map((trip) => (
                    <button
                      key={trip._id}
                      onClick={() => router.push(`/trips/${trip._id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {trip.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {trip.destination}
                        </p>
                      </div>
                      <span className="text-xs capitalize text-neutral-400">
                        {trip.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
