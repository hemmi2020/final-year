"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        textAlign: "center",
      }}
    >
      <MapPin size={64} style={{ color: "var(--orange)", marginBottom: 24 }} />
      <h1
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginTop: 8,
        }}
      >
        Page Not Found
      </p>
      <p
        style={{
          fontSize: 16,
          color: "var(--text-secondary)",
          marginTop: 8,
          maxWidth: 400,
        }}
      >
        Looks like you've wandered off the map. Let's get you back on track.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button
          onClick={() => router.push("/")}
          className="btn-orange"
          style={{ padding: "12px 28px", fontSize: 15 }}
        >
          Go Home
        </button>
        <button
          onClick={() => router.push("/chat")}
          className="btn-outline"
          style={{ padding: "12px 28px", fontSize: 15 }}
        >
          Start Planning
        </button>
      </div>
    </div>
  );
}
