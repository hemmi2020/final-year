"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usersAPI } from "@/lib/api";
import { ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const STEPS = [
  {
    title: "What's your travel style?",
    key: "travelStyle",
    type: "single",
    options: [
      { value: "solo", label: "Solo Explorer", emoji: "🧳" },
      { value: "couple", label: "Romantic Getaway", emoji: "💑" },
      { value: "family", label: "Family Adventure", emoji: "👨‍👩‍👧‍👦" },
      { value: "group", label: "Group Trip", emoji: "👥" },
    ],
  },
  {
    title: "What's your budget preference?",
    key: "budget",
    type: "single",
    options: [
      { value: "budget", label: "Budget Friendly", emoji: "💰" },
      { value: "moderate", label: "Moderate Comfort", emoji: "💳" },
      { value: "luxury", label: "Luxury Experience", emoji: "💎" },
    ],
  },
  {
    title: "Any dietary preferences?",
    key: "dietary",
    type: "multi",
    options: [
      { value: "halal", label: "Halal", emoji: "🥩" },
      { value: "vegan", label: "Vegan", emoji: "🌱" },
      { value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
      { value: "kosher", label: "Kosher", emoji: "✡️" },
      { value: "gluten-free", label: "Gluten Free", emoji: "🌾" },
    ],
  },
  {
    title: "What interests you most?",
    key: "interests",
    type: "multi",
    options: [
      { value: "history", label: "History & Culture", emoji: "🏛️" },
      { value: "food", label: "Food & Cuisine", emoji: "🍜" },
      { value: "adventure", label: "Adventure", emoji: "🏔️" },
      { value: "nature", label: "Nature", emoji: "🌿" },
      { value: "shopping", label: "Shopping", emoji: "🛍️" },
      { value: "nightlife", label: "Nightlife", emoji: "🌃" },
      { value: "art", label: "Art & Museums", emoji: "🎨" },
      { value: "photography", label: "Photography", emoji: "📸" },
    ],
  },
  {
    title: "Preferred currency?",
    key: "preferredCurrency",
    type: "single",
    options: [
      { value: "USD", label: "US Dollar", emoji: "🇺🇸" },
      { value: "EUR", label: "Euro", emoji: "🇪🇺" },
      { value: "GBP", label: "British Pound", emoji: "🇬🇧" },
      { value: "PKR", label: "Pakistani Rupee", emoji: "🇵🇰" },
      { value: "INR", label: "Indian Rupee", emoji: "🇮🇳" },
      { value: "AED", label: "UAE Dirham", emoji: "🇦🇪" },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const { isAuthenticated, updateUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    travelStyle: "",
    budget: "",
    dietary: [],
    interests: [],
    preferredCurrency: "USD",
    temperatureUnit: "metric",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleSelect = (value) => {
    if (current.type === "single") {
      setAnswers({ ...answers, [current.key]: value });
    } else {
      const arr = answers[current.key] || [];
      setAnswers({
        ...answers,
        [current.key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      });
    }
  };

  const isSelected = (value) => {
    if (current.type === "single") return answers[current.key] === value;
    return (answers[current.key] || []).includes(value);
  };

  const canNext = current.type === "single" ? !!answers[current.key] : true; // multi can be empty

  const handleFinish = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setSaving(true);
    try {
      await usersAPI.updatePreferences(answers);
      updateUser({ preferences: answers });
      setDone(true);
    } catch {}
    setSaving(false);
  };

  if (done) {
    return (
      <Container className="py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            You're All Set!
          </h1>
          <p className="text-neutral-600 mb-8">
            Your travel preferences have been saved. Our AI will now personalize
            everything for you.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push("/chat")}>
              <Sparkles className="w-4 h-4 mr-2" /> Start Planning
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary-500" : "bg-neutral-200"}`}
            />
          ))}
        </div>

        <p className="text-sm text-neutral-500 mb-2">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">
          {current.title}
        </h1>

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected(opt.value)
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <p className="font-medium text-neutral-900 mt-2">{opt.label}</p>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {isLast ? (
            <Button
              variant="primary"
              onClick={handleFinish}
              loading={saving}
              disabled={!canNext}
            >
              <Sparkles className="w-4 h-4 mr-1" /> Save Preferences
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </Container>
  );
}
