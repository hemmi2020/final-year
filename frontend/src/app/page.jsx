"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Send, Globe, Plane, Landmark, Mountain } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [input, setInput] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    router.push(`/chat?q=${encodeURIComponent(input.trim())}`);
  };

  const handleQuickAction = (text) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    router.push(`/chat?q=${encodeURIComponent(text)}`);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Hero heading */}
      <h1
        style={{
          fontSize: "clamp(36px, 6vw, 60px)",
          fontWeight: 800,
          color: "var(--text-primary)",
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        Hey, I'm your personal{" "}
        <span style={{ color: "var(--orange)" }}>Trip Planner</span>
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "var(--text-secondary)",
          textAlign: "center",
          maxWidth: 560,
          marginBottom: 40,
          lineHeight: 1.6,
        }}
      >
        Tell me what you want, and I'll handle the rest: Flights, Hotels, Trip
        Planner — all in seconds
      </p>

      {/* Main input */}
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          position: "relative",
          marginBottom: 32,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Create a trip for Paris from New York..."
          style={{
            width: "100%",
            minHeight: 120,
            padding: "20px 64px 20px 24px",
            border: "1.5px solid var(--border)",
            borderRadius: 16,
            fontSize: 16,
            fontFamily: "inherit",
            color: "var(--text-primary)",
            resize: "none",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--orange)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: input.trim() ? "var(--orange)" : "#D1D5DB",
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <Send size={20} color="#FFF" />
        </button>
      </div>

      {/* Quick action pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {[
          { icon: "🌐", label: "Create New Trip" },
          { icon: "✈️", label: "Inspire me where to go" },
          { icon: "🏛️", label: "Discover Hidden gems" },
          { icon: "🌍", label: "Adventure Destination" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.label)}
            className="pill-action"
          >
            <span style={{ fontSize: 18 }}>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Login modal for non-auth users */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
}
