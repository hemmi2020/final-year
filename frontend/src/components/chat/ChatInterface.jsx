"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Save, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Great choice! I can help you plan an amazing trip. Here's what I suggest:\n\n✈️ Best time to visit\n🏨 Accommodation options\n🍽️ Local cuisine recommendations\n📍 Must-see attractions\n\nWould you like me to create a detailed itinerary for you?`,
        actions: ["save", "book"],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleAction = (action) => {
    if (!isAuthenticated) {
      // Show login prompt and open modal
      const loginPrompt = {
        id: Date.now(),
        role: "system",
        content:
          "🔐 Please sign in to save your itinerary or make bookings. Your chat history will be preserved!",
        requiresAuth: true,
      };
      setMessages((prev) => [...prev, loginPrompt]);
      setIsLoginModalOpen(true);
      return;
    }

    // Handle authenticated actions
    if (action === "save") {
      router.push("/dashboard?action=save");
    } else if (action === "book") {
      router.push("/trips/new");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              AI Travel Assistant
            </h2>
            <p className="text-sm text-neutral-600">Powered by GPT-4</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex space-x-3 max-w-3xl ${
                message.role === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-primary-600"
                    : message.role === "system"
                      ? "bg-accent-500"
                      : "bg-gradient-to-br from-primary-500 to-secondary-500"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : message.role === "system" ? (
                  <Sparkles className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary-600 text-white"
                    : message.role === "system"
                      ? "bg-accent-50 text-accent-900 border border-accent-200"
                      : "bg-white text-neutral-900 shadow-sm border border-neutral-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Action Buttons */}
                {message.actions && (
                  <div className="flex space-x-2 mt-3">
                    {message.actions.includes("save") && (
                      <button
                        onClick={() => handleAction("save")}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Itinerary</span>
                      </button>
                    )}
                    {message.actions.includes("book") && (
                      <button
                        onClick={() => handleAction("book")}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors text-sm font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Book Now</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Login Button for System Messages */}
                {message.requiresAuth && (
                  <div className="mt-3">
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

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-neutral-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-neutral-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about your travel plans..."
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <Button
              variant="primary"
              size="lg"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            💡 Tip: You can chat freely! Sign in to save your itineraries and
            make bookings.
          </p>
        </div>
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
