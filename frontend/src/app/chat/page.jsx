"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { chatAPI } from "@/lib/api";
import { Send, Globe, Sparkles, Save, Download } from "lucide-react";
import { MessageRenderer } from "@/components/chat/GenerativeUI";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/chat");
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

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setShowInitial(false);
    const userMsg = { id: Date.now(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const { data } = await chatAPI.send(text.trim());
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: data.data.message },
      ]);
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

  const handleQuickAction = (text) => sendMessage(text);

  const handleNewTrip = () => {
    setMessages([]);
    setShowInitial(true);
    setInput("");
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
                  }}
                  className={msg.role === "user" ? "msg-user" : "msg-ai"}
                >
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
                        maxWidth: "90%",
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
              {typing && (
                <div style={{ display: "flex", gap: 6, padding: "14px 18px" }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
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

      {/* ─── RIGHT PANEL — Globe/Map placeholder ─── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          background: "var(--navy)",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
          <Globe size={120} strokeWidth={0.5} />
          <p style={{ marginTop: 16, fontSize: 16, fontWeight: 500 }}>
            Interactive Globe
          </p>
          <p style={{ fontSize: 13, marginTop: 4, maxWidth: 280 }}>
            Destinations will appear here as you plan your trip
          </p>
        </div>
      </div>
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
