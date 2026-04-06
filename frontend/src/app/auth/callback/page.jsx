"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (token && name && email) {
      setUser({ id, name, email, role: "user" }, token);
      // Sync preferences after login
      try {
        const ps =
          require("@/store/preferenceStore").usePreferenceStore.getState();
      } catch {}
      router.push("/chat");
    } else {
      router.push("/login?error=google_failed");
    }
  }, [searchParams, setUser, router]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader2
        size={40}
        style={{ color: "var(--orange)", animation: "spin 1s linear infinite" }}
      />
      <p style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>
        Signing you in...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
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
      <CallbackContent />
    </Suspense>
  );
}
