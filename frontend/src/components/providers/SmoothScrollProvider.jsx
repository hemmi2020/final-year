"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "@studio-freight/lenis";

/**
 * Smooth scroll provider using Lenis
 * Disabled on pages that manage their own scroll (chat, quiz)
 */
export default function SmoothScrollProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Disable smooth scroll on pages that need native scroll behavior
    const disabledPages = [
      "/chat",
      "/quiz",
      "/settings",
      "/admin",
      "/dashboard",
      "/trips",
      "/profile",
    ];
    const shouldDisable = disabledPages.some((p) => pathname?.startsWith(p));

    if (shouldDisable) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
