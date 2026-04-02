"use client";

import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="fixed inset-0 top-16 z-10 bg-neutral-50">
      <ChatInterface />
    </div>
  );
}
