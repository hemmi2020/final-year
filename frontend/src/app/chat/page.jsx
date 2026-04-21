"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { chatAPI, tripsAPI } from "@/lib/api";
import { Send } from "lucide-react";
import { MessageRenderer } from "@/components/chat/GenerativeUI";
import GlobeMap from "@/components/map/GlobeMap";
import { extractDestinationFromText } from "@/lib/extractDestination";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ShareTripModal from "@/components/chat/ShareTripModal";
import { useLocation } from "@/hooks/useLocation";
import { useTripState, extractFields } from "@/hooks/useTripState";
import QuickReplyChips from "@/components/chat/QuickReplyChips";
import ItineraryCard from "@/components/chat/ItineraryCard";

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
function GeneratingPanel({ origin, destination }) {
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
        return prev + 1.25;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    setChecklist((prev) =>
      prev.map((item, idx) => ({
        ...item,
        done: progress >= thresholds[idx],
      })),
    );
  }, [progress]);

  const displayOrigin = origin || "Your City";
  const displayDestination = destination || "Destination";

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
          {displayOrigin} to {displayDestination} Trip
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
  const [currentDestination, setCurrentDestination] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const location = useLocation();
  const userLocation =
    location.lat && location.lng
      ? { lat: location.lat, lng: location.lng, city: location.city }
      : null;

  const {
    tripState,
    updateField,
    getNextQuestion,
    isComplete,
    reset,
    chatStage,
    setChatStage,
  } = useTripState(location);

  const messagesEnd = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const hasInitialized = useRef(false);
  const generationTriggered = useRef(false);
  const tripStateRef = useRef(tripState);
  const wasCompleteOnMount = useRef(isComplete); // Track if already complete on mount

  // Keep ref in sync with latest tripState
  useEffect(() => {
    tripStateRef.current = tripState;
  }, [tripState]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Initialize greeting + first question on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If there's a destination param from destinations page, auto-fill and skip to duration
    const destParam = searchParams.get("destination");
    if (destParam) {
      updateField("destination", destParam);
      const greeting = {
        id: Date.now(),
        role: "assistant",
        content: `Great choice! Let's plan your trip to ${destParam}! 🌍`,
      };
      const durationQ = {
        id: Date.now() + 1,
        role: "assistant",
        content: "How long would you like your trip to be?",
        chipType: "duration",
        multiSelect: false,
      };
      setMessages([greeting, durationQ]);
      return;
    }

    // If there's a query param, skip the greeting+question — handleUserMessage will handle it
    const q = searchParams.get("q");
    if (q) {
      const greeting = {
        id: Date.now(),
        role: "assistant",
        content: "Hey! 👋 Let me help you with that...",
      };
      setMessages([greeting]);
      // Process the query after a tick
      setTimeout(() => handleUserMessage(q), 200);
      return;
    }

    const greeting = {
      id: Date.now(),
      role: "assistant",
      content:
        "Hey! 👋 I'm your AI travel planner. Let's create an amazing trip together!\n\nWhere would you like to go?",
      chipType: "destination",
      multiSelect: false,
    };
    setMessages([greeting]);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Query param handled in initialization above

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, typing]);

  // Define triggerGenerationWithState BEFORE the useEffect that calls it
  async function triggerGenerationWithState(ts) {
    // Guard: don't call API without destination
    if (!ts || !ts.destination) {
      console.log("[triggerGeneration] No destination, aborting");
      generationTriggered.current = false;
      return;
    }

    setChatStage("generating");

    const genMsg = {
      id: Date.now(),
      role: "assistant",
      content:
        "Perfect! I have everything I need. Let me craft your dream itinerary... ✨",
    };
    setMessages((prev) => [...prev, genMsg]);

    try {
      const { data } = await tripsAPI.generate({
        destination: ts.destination,
        origin: ts.origin,
        duration: ts.duration,
        travelCompanion: ts.travelCompanion,
        vibe: ts.vibe,
        budget: ts.budget,
        dates: ts.dates,
        interests: Array.isArray(ts.vibe) ? ts.vibe : [],
        dietary: ["halal"],
      });

      const trip = data.data?.trip;
      const itinerary = data.data?.itinerary;

      if (trip?._id) {
        setTripId(trip._id);
        setIsSaved(true);
      }
      if (itinerary) {
        setItineraryData(itinerary);
      }

      setChatStage("ready");

      const readyMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Your ${ts.destination} itinerary is ready! 🎉 Check out the full plan on the right panel. You can save it, share it with the community, or ask me to modify anything.`,
      };
      setMessages((prev) => [...prev, readyMsg]);
    } catch (err) {
      // DON'T reset generationTriggered — prevents infinite retry loop
      setChatStage("greeting");
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Sorry, I couldn't generate your itinerary right now. Please try again by clicking + New Trip.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }

  // Auto-trigger generation when isComplete becomes true (NOT on page load from session restore)
  useEffect(() => {
    if (wasCompleteOnMount.current) {
      wasCompleteOnMount.current = false;
      return;
    }
    if (
      isComplete &&
      !generationTriggered.current &&
      chatStage !== "generating" &&
      chatStage !== "ready" &&
      tripState.destination
    ) {
      generationTriggered.current = true;
      triggerGenerationWithState(tripState);
    }
  }, [isComplete, chatStage, tripState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Acknowledgment messages for each field — no AI call needed
  const ACK_MESSAGES = {
    destination: (v) =>
      `${v} — great choice! 🌍 That's going to be an amazing trip.`,
    duration: (v) => `${v} sounds perfect! ⏱️ Plenty of time to explore.`,
    travelCompanion: (v) => `${v} trip — love it! 🎒`,
    vibe: (v) =>
      `${Array.isArray(v) ? v.join(", ") : v} — I'll make sure to include all of that! ✨`,
    budget: (v) =>
      `${v} budget — got it! 💰 I'll find the best options for you.`,
  };

  const advanceToNextQuestion = (updatedState, dryRun = false) => {
    // Check completion with the latest state
    const requiredFields = [
      "destination",
      "duration",
      "travelCompanion",
      "vibe",
      "budget",
    ];
    const allFilled = requiredFields.every((f) => updatedState[f] != null);
    if (allFilled) {
      // isComplete useEffect will trigger generation
      return dryRun ? null : undefined;
    }

    // Find next unfilled field from the QUESTION_SEQUENCE
    const questionSequence = [
      {
        field: "destination",
        prompt: "Where would you like to go? Tell me your dream destination!",
        chipType: "destination",
        multiSelect: false,
      },
      {
        field: "duration",
        prompt: "How long would you like your trip to be?",
        chipType: "duration",
        multiSelect: false,
      },
      {
        field: "travelCompanion",
        prompt: "Who are you traveling with?",
        chipType: "travelCompanion",
        multiSelect: false,
      },
      {
        field: "vibe",
        prompt:
          "What kind of vibe are you looking for? Pick as many as you like!",
        chipType: "vibe",
        multiSelect: true,
      },
      {
        field: "budget",
        prompt: "What's your budget range for this trip?",
        chipType: "budget",
        multiSelect: false,
      },
    ];

    let nextQ = null;
    for (const q of questionSequence) {
      if (updatedState[q.field] == null) {
        nextQ = q;
        break;
      }
    }

    // Dry run — just return the field name without appending
    if (dryRun) return nextQ?.field || null;

    if (nextQ) {
      const questionMsg = {
        id: Date.now() + 3,
        role: "assistant",
        content: nextQ.prompt,
        chipType: nextQ.chipType,
        multiSelect: nextQ.multiSelect,
      };
      setMessages((prev) => [...prev, questionMsg]);
    }
  };

  const handleUserMessage = async (text) => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    const userMsg = { id: Date.now(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(scrollToBottom, 50);

    // Extract fields from user text
    const extracted = extractFields(trimmed);
    const filledFields = Object.entries(extracted).filter(([, v]) => v != null);

    // Update state for each extracted field
    const updatedState = { ...tripState };
    filledFields.forEach(([field, value]) => {
      updateField(field, value);
      updatedState[field] = value;
    });

    // If we extracted trip-planning fields, acknowledge locally (no AI call)
    if (filledFields.length > 0) {
      // Build a short acknowledgment from the first extracted field
      const [firstField, firstValue] = filledFields[0];
      const ackFn = ACK_MESSAGES[firstField];
      const ackText = ackFn ? ackFn(firstValue) : "Got it! ✅";

      const ackMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: ackText,
      };
      setMessages((prev) => [...prev, ackMsg]);

      // Detect destination for map
      if (extracted.destination) {
        extractDestinationFromText(extracted.destination).then((dest) => {
          if (dest) setCurrentDestination(dest);
        });
      }

      // Advance to next question
      setTimeout(() => advanceToNextQuestion(updatedState), 200);
      return;
    }

    // No trip fields extracted — this is free-text chat, send to AI backend
    setTyping(true);
    try {
      const { data } = await chatAPI.send(trimmed, tripState);
      const aiContent =
        data.data?.message ||
        data.data?.response ||
        "I understand! Let me help you plan your trip.";

      // Strip ALL <component> tags from AI response — state machine handles the flow
      const cleanContent = aiContent
        .replace(/<component[^>]*\/>/g, "")
        .replace(/<component[^>]*>[^<]*<\/component>/g, "")
        .replace(/<component[^>]*>/g, "")
        .trim();

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: cleanContent || aiContent,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Do NOT extract fields from AI responses — only from user messages
      // AI responses contain city names as suggestions, not user selections

      // Detect destination for map (visual only, doesn't set tripState)
      extractDestinationFromText(cleanContent + " " + trimmed).then((dest) => {
        if (dest) setCurrentDestination(dest);
      });

      // Check if AI response already covers the next question topic
      // If AI is suggesting destinations or asking about any trip field, don't add state machine question
      const nextField = advanceToNextQuestion(updatedState, true);
      const FIELD_KEYWORDS = {
        destination:
          /(?:destination|where|which city|which country|interested in visiting|want to go|like to travel|these destinations|catches your eye|start planning)/i,
        duration: /(?:how long|how many days|duration|length of|stay for)/i,
        travelCompanion:
          /(?:who.*travel|solo|friends|family|couple|companion|traveling with)/i,
        vibe: /(?:vibe|interests|activities|what kind|experience|prefer)/i,
        budget: /(?:budget|spend|cost|price|expensive|cheap|luxury|mid-range)/i,
      };
      const fieldPattern = nextField && FIELD_KEYWORDS[nextField];
      const aiAlreadyCoversNext =
        fieldPattern && fieldPattern.test(cleanContent);

      // Also skip if AI response is long (>200 chars) and asks a question — it's conversational
      const aiAsksQuestion =
        cleanContent.includes("?") && cleanContent.length > 200;

      if (!aiAlreadyCoversNext && !aiAsksQuestion) {
        setTimeout(() => advanceToNextQuestion(updatedState), 300);
      }
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

  const handleChipSelect = (value) => {
    // Determine which question the chips are for (last message with chipType)
    const lastChipMsg = [...messages].reverse().find((m) => m.chipType);
    if (!lastChipMsg) return;

    const chipType = lastChipMsg.chipType;
    const displayValue = Array.isArray(value) ? value.join(", ") : value;

    // Add user message
    const userMsg = { id: Date.now(), role: "user", content: displayValue };
    setMessages((prev) => [...prev, userMsg]);

    // Handle "Custom" duration — ask user to type instead of setting a meaningless value
    if (chipType === "duration" && value === "Custom") {
      const customMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "How many days would you like? Just type a number like '5 days' or '10 days'.",
      };
      setMessages((prev) => [...prev, userMsg, customMsg]);
      return; // Don't update field, don't advance
    }

    // Update the field
    updateField(chipType, value);

    // Build updated state
    const updatedState = { ...tripState, [chipType]: value };

    // Acknowledge locally — no AI call needed for chip selections
    const ackFn = ACK_MESSAGES[chipType];
    const ackText = ackFn ? ackFn(displayValue) : "Great choice! ✅";
    const ackMsg = { id: Date.now() + 1, role: "assistant", content: ackText };
    setMessages((prev) => [...prev, ackMsg]);

    // Detect destination for map
    if (chipType === "destination") {
      extractDestinationFromText(displayValue).then((dest) => {
        if (dest) setCurrentDestination(dest);
      });
    }

    // Advance to next question
    setTimeout(() => advanceToNextQuestion(updatedState), 200);
  };

  const handleNewTrip = () => {
    reset();
    setMessages([]);
    setInput("");
    setCurrentDestination(null);
    setTripId(null);
    setItineraryData(null);
    setIsSaved(false);
    setShareModalOpen(false);
    generationTriggered.current = false;
    wasCompleteOnMount.current = false;
    hasInitialized.current = false;

    // Re-initialize with greeting
    setTimeout(() => {
      hasInitialized.current = true;
      const greeting = {
        id: Date.now(),
        role: "assistant",
        content: "Let's plan a new trip! 🌍 Where would you like to go?",
        chipType: "destination",
        multiSelect: false,
      };
      setMessages([greeting]);
    }, 100);
  };

  const handleSave = async () => {
    if (isSaved || tripId) return;
    try {
      const { data } = await tripsAPI.generate({
        destination: tripState.destination,
        origin: tripState.origin,
        duration: tripState.duration,
        travelCompanion: tripState.travelCompanion,
        vibe: tripState.vibe,
        budget: tripState.budget,
        dates: tripState.dates,
        interests: Array.isArray(tripState.vibe) ? tripState.vibe : [],
        dietary: ["halal"],
      });
      const trip = data.data?.trip;
      if (trip?._id) {
        setTripId(trip._id);
        setIsSaved(true);
      }
    } catch {
      // Error handled silently
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleModify = () => {
    setChatStage("greeting");
    generationTriggered.current = false;
    const modifyMsg = {
      id: Date.now(),
      role: "assistant",
      content:
        "Sure! What would you like to change about your trip? You can update the destination, duration, companions, vibe, or budget.",
    };
    setMessages((prev) => [...prev, modifyMsg]);
  };

  // Determine if we should show chips (last AI message has chipType and we're not generating/ready)
  const lastMessage = messages[messages.length - 1];
  const showChips =
    lastMessage?.role === "assistant" &&
    lastMessage?.chipType &&
    chatStage !== "generating" &&
    chatStage !== "ready" &&
    !typing;

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
          {messages.length > 0 && (
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
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            scrollBehavior: "smooth",
          }}
        >
          {/* Active chat messages */}
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
                      onSendMessage={handleUserMessage}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && <TypingIndicator />}

            {/* Quick Reply Chips — shown below last AI message when it has chipType */}
            {showChips && (
              <div style={{ paddingLeft: 38 }}>
                <QuickReplyChips
                  questionType={lastMessage.chipType}
                  onSelect={handleChipSelect}
                  multiSelect={lastMessage.multiSelect || false}
                />
              </div>
            )}

            <div ref={messagesEnd} />
          </div>
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
                  handleUserMessage(input);
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
              disabled={typing || chatStage === "generating"}
            />
            <button
              onClick={() => handleUserMessage(input)}
              disabled={!input.trim() || typing || chatStage === "generating"}
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
            visibility:
              chatStage === "generating" || chatStage === "ready"
                ? "hidden"
                : "visible",
          }}
        >
          <GlobeMap
            destination={currentDestination}
            userLocation={
              userLocation
                ? { lat: userLocation.lat, lng: userLocation.lng }
                : null
            }
          />
        </div>

        {/* Understanding overlay — shown when messages exist and stage is greeting */}
        {chatStage === "greeting" && messages.length > 2 && (
          <UnderstandingOverlay />
        )}

        {/* Generating panel — animated progress */}
        {chatStage === "generating" && (
          <GeneratingPanel
            origin={tripState.origin || location.city}
            destination={tripState.destination}
          />
        )}

        {/* Itinerary Card — shown when ready */}
        {chatStage === "ready" && itineraryData && (
          <ItineraryCard
            itinerary={itineraryData}
            tripId={tripId}
            origin={tripState.origin || location.city}
            destination={tripState.destination}
            onSave={handleSave}
            onShare={handleShare}
            onModify={handleModify}
            isSaved={isSaved}
          />
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
      <ShareTripModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        tripTitle={
          tripState.destination ? `${tripState.destination} Trip` : "My Trip"
        }
        tripId={tripId}
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
