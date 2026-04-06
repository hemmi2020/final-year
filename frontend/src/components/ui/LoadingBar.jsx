"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setLoading(true);
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70), 100);
    const t2 = setTimeout(() => setWidth(100), 300);
    const t3 = setTimeout(() => {
      setLoading(false);
      setWidth(0);
    }, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!loading && width === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        zIndex: 9999,
        width: `${width}%`,
        background:
          "linear-gradient(90deg, var(--orange), var(--orange-light))",
        transition: "width 0.3s ease",
        opacity: loading ? 1 : 0,
      }}
    />
  );
}
