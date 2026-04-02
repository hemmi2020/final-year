"use client";

import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: "#f9fafb",
      }}
    >
      <ChatInterface />
    </div>
  );
}
