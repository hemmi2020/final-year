"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { chatAPI } from "@/lib/api";
import { Send, Globe, Sparkles, Save, Download } from "lucide-react";
import { MessageRenderer } from "@/components/chat/GenerativeUI";
import GlobeMap from "@/components/map/GlobeMap";
import { extractDestinationFromText } from "@/lib/extractDestination";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { useLocation } from "@/hooks/useLocation";

/* ── Animated typing dots component ── */
function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 18px",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF4500, #FF6B35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#FFF", fontSize: 10, fontWeight: 700 }}>AI</span>
      </div>
      <span style={{ fontSize: 14, color: "#6B7280", fontStyle: "italic" }}>
        TravelAI is typing
      </span>
      <span
        className="typing-animated-dots"
        style={{ display: "inline-flex", gap: 2 }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </span>
    </div>
  );
}

/* ── Generating progress panel ── */
function GeneratingPanel({ destination }) {
  const [progress, setProgress] = useState(0);
  const [checklist, setChecklist] = useState([
    { label: "Optimizing your route", done: false },
    { label: "Finding halal restaurants", done: false },
    { label: "Searching best hotels", done: false },
    { label: "Building day-by-day plan", done: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.25; // 0→100 in 8 seconds (100/1.25 = 80 ticks * 100ms)
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate checklist items at 25%, 50%, 75%, 100%
    const thresholds = [25, 50, 75, 100];
    setChecklist((prev) =>
      prev.map((item, idx) => ({
        ...item,
        done: progress >= thresholds[idx],
      })),
    );
  }, [progress]);

  const displayName = destination || "Your";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #FF8C00 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        zIndex: 5,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#FFFFFF",
            margin: "0 0 8px",
          }}
        >
          {displayName} Trip
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            margin: "0 0 32px",
          }}
        >
          Crafting your perfect itinerary...
        </p>

        {/* Checklist */}
        <div style={{ textAlign: "left", marginBottom: 32 }}>
          {checklist.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom:
                  idx < checklist.length - 1
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.done ? "✓" : "⏳"}</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: item.done ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                  transition: "color 0.3s",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,0.2)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: `${Math.min(progress, 100)}%`,
              height: "100%",
              borderRadius: 4,
              background: "#FFFFFF",
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <p
          style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", margin: 0 }}
        >
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>
    </div>
  );
}

/* ── Understanding overlay ── */
function UnderstandingOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 5,
        background: "linear-gradient(135deg, #FF4500, #FF6B35)",
        borderRadius: 16,
        padding: "14px 28px",
        boxShadow: "0 8px 32px rgba(255,69,0,0.3)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 600,
          color: "#FFFFFF",
          whiteSpace: "nowrap",
        }}
      >
        🌍 Understanding your trip...
      </p>
    </div>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [chatStage, setChatStage] = useState("initial");
  const [generatingDest, setGeneratingDest] = useState("");
  const location = useLocation();
  const userLocation =
    location.lat && location.lng
      ? { lat: location.lat, lng: location.lng }
      : null;
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const generatingTimerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    const q = searchParams.get("q");
    if (q) {
      sendMessage(q);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Cleanup generating timer on unmount
  useEffect(() => {
    return () => {
      if (generatingTimerRef.current) clearTimeout(generatingTimerRef.current);
    };
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setShowInitial(false);
    const trimmed = text.trim();
    const userMsg = { id: Date.now(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Stage transitions
    const lowerText = trimmed.toLowerCase();
    const isGenerateRequest =
      lowerText.includes("generate") || lowerText.includes("itinerary");

    if (isGenerateRequest) {
      // Extract destination name from recent messages for the generating panel
      const destName = extractDestNameFromMessages([...messages, userMsg]);
      setGeneratingDest(destName);
      setChatStage("generating");
      // Auto-transition to "ready" after 8 seconds
      generatingTimerRef.current = setTimeout(() => {
        setChatStage("ready");
      }, 8000);
    } else if (chatStage === "initial") {
      setChatStage("understanding");
    }

    setTyping(true);

    try {
      const { data } = await chatAPI.send(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: data.data.message },
      ]);
      // Detect destination via Mapbox geocoding
      extractDestinationFromText(data.data.message + " " + trimmed).then(
        (dest) => {
          if (dest) setCurrentDestination(dest);
        },
      );
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // Simple helper to extract a destination name from message history
  const extractDestNameFromMessages = (msgs) => {
    // Look through messages for common destination patterns
    for (let i = msgs.length - 1; i >= 0; i--) {
      const content = msgs[i].content;
      // Try to find destination-like words (capitalized place names)
      const match = content.match(
        /(?:to|visit|trip to|going to|travel to|explore)\s+([A-Z][a-zA-Z\s]{2,20})/,
      );
      if (match) return match[1].trim();
    }
    return "Your";
  };

  const handleQuickAction = (text) => sendMessage(text);

  const handleNewTrip = () => {
    setMessages([]);
    setShowInitial(true);
    setInput("");
    setChatStage("initial");
    setCurrentDestination(null);
    setGeneratingDest("");
    if (generatingTimerRef.current) clearTimeout(generatingTimerRef.current);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* ─── LEFT PANEL ─── */}
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border-light)",
          background: "#FFFFFF",
        }}
        className="lg:max-w-[580px]"
      >
        {/* Top bar */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Start Planning new{" "}
              <span style={{ color: "var(--orange)" }}>Trip</span> using AI
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                margin: 0,
                marginTop: 2,
              }}
            >
              Discover personalized travel itineraries
            </p>
          </div>
          {!showInitial && (
            <button
              onClick={handleNewTrip}
              className="btn-orange"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              + New Trip
            </button>
          )}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {showInitial ? (
            /* Initial state — quick actions */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 20,
              }}
            >
              {[
                { icon: "🌐", label: "Create New Trip" },
                { icon: "✈️", label: "Inspire me where to go" },
                { icon: "🏛️", label: "Discover Hidden gems" },
                { icon: "🌍", label: "Adventure Destination" },
              ].map((a, idx) => (
                <button
                  key={a.label}
                  onClick={() => handleQuickAction(a.label)}
                  className={`stagger-${idx + 1}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 20px",
                    background: "#FFF",
                    border: "1.5px solid var(--border)",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--orange)";
                    e.currentTarget.style.background = "var(--orange-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "#FFF";
                  }}
                >
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          ) : (
            /* Active chat messages */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                  className={msg.role === "user" ? "msg-user" : "msg-ai"}
                >
                  {/* AI Avatar */}
                  {msg.role === "assistant" && (
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF4500, #FF6B35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <span
                        style={{ color: "#FFF", fontSize: 10, fontWeight: 700 }}
                      >
                        AI
                      </span>
                    </div>
                  )}
                  {msg.role === "user" ? (
                    <span
                      className="bubble-user"
                      style={{
                        padding: "8px 20px",
                        fontSize: 15,
                        fontWeight: 500,
                      }}
                    >
                      {msg.content}
                    </span>
                  ) : (
                    <div
                      className="bubble-ai"
                      style={{
                        padding: "14px 18px",
                        maxWidth: "85%",
                      }}
                    >
                      <MessageRenderer
                        content={msg.content}
                        onSendMessage={sendMessage}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && <TypingIndicator />}
              <div ref={messagesEnd} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--border-light)",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Start typing here..."
              style={{
                width: "100%",
                minHeight: 52,
                maxHeight: 120,
                padding: "14px 56px 14px 16px",
                border: "1.5px solid var(--border)",
                borderRadius: 12,
                fontSize: 15,
                fontFamily: "inherit",
                color: "var(--text-primary)",
                resize: "none",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--orange)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              disabled={typing}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: input.trim() ? "var(--orange)" : "#D1D5DB",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <Send size={18} color="#FFF" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Dynamic based on chatStage ─── */}
      <div
        className="hidden lg:block"
        style={{ flex: 1, position: "relative" }}
      >
        {/* Mapbox is ALWAYS rendered so it doesn't re-initialize */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            visibility: chatStage === "generating" ? "hidden" : "visible",
          }}
        >
          <GlobeMap
            destination={currentDestination}
            userLocation={userLocation}
          />
        </div>

        {/* Understanding overlay — shown when messages exist and stage is understanding */}
        {(chatStage === "understanding" ||
          (chatStage === "initial" && messages.length > 0)) && (
          <UnderstandingOverlay />
        )}

        {/* Generating panel — animated progress */}
        {chatStage === "generating" && (
          <GeneratingPanel destination={generatingDest} />
        )}
      </div>

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

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 64px)",
          }}
        >
          Loading...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
