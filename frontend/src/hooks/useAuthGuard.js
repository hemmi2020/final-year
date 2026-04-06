"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Redirects to /login if not authenticated
 * Returns isAuthenticated boolean
 */
export function useAuthGuard() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, pathname, router]);

    return isAuthenticated;
}
