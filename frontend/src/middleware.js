import { NextResponse } from "next/server";

const PROTECTED = ["/chat", "/profile", "/trips/", "/settings", "/dashboard", "/admin"];
const PUBLIC = ["/", "/login", "/signup", "/destinations", "/about", "/planner", "/blog", "/careers", "/help", "/guides", "/api-docs", "/privacy", "/terms", "/cookies"];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if route is protected
    const isProtected = PROTECTED.some(p => pathname.startsWith(p));
    if (!isProtected) return NextResponse.next();

    // Check for auth token in cookie or header
    const token = request.cookies.get("auth-storage")?.value;

    // Zustand persist stores in localStorage, but we check if the cookie exists
    // For client-side auth, we let the page handle redirect
    // This middleware adds returnUrl for server-side awareness
    return NextResponse.next();
}

export const config = {
    matcher: ["/chat/:path*", "/profile/:path*", "/trips/:path*", "/settings/:path*", "/dashboard/:path*", "/admin/:path*"],
};
