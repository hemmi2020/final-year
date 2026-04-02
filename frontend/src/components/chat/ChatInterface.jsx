"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Save, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { chatAPI } from "@/lib/api";

export default function ChatInterface() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm your AI travel assistant. Tell me about your dream destination, and I'll help you plan the perfect trip! 🌍✈️",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const messageText = input.trim();

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: messageText },
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const { data } = await chatAPI.send(messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.data.message,
          actions: ["save", "book"],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            err.response?.data?.error ||
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (action) => {
    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "system",
          content: "🔐 Please sign in to save your itinerary or make bookings.",
          requiresAuth: true,
        },
      ]);
      setIsLoginModalOpen(true);
      return;
    }
    if (action === "save") router.push("/dashboard");
    else if (action === "book") router.push("/trips");
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              AI Travel Assistant
            </h2>
            <p className="text-xs text-neutral-500">Powered by GPT-4o-mini</p>
          </div>
        </div>
      </div>

      {/* Messages — this is the scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2.5 max-w-[85%] sm:max-w-2xl ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === "user"
                    ? "bg-primary-600"
                    : msg.role === "system"
                      ? "bg-accent-500"
                      : "bg-gradient-to-br from-primary-500 to-secondary-500"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-white" />
                ) : msg.role === "system" ? (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white rounded-tr-sm"
                    : msg.role === "system"
                      ? "bg-accent-50 text-accent-900 border border-accent-200 rounded-tl-sm"
                      : "bg-white text-neutral-800 border border-neutral-200 shadow-sm rounded-tl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>

                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-neutral-100">
                    <button
                      onClick={() => handleAction("save")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-xs font-medium"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Itinerary
                    </button>
                    <button
                      onClick={() => handleAction("book")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors text-xs font-medium"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Plan Trip
                    </button>
                  </div>
                )}

                {msg.requiresAuth && (
                  <div className="mt-2.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Sign In to Continue
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-neutral-200 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — pinned at bottom */}
      <div className="bg-white border-t border-neutral-200 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me anything about your travel plans..."
            className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            disabled={isTyping}
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-400 mt-1.5 text-center">
          No login needed to chat · Sign in to save trips
        </p>
      </div>

      {/* Auth Modals */}
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
    </div>
  );
}
