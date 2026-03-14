"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { NAV_LINKS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import Container from "./Container";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { User, LogOut } from "lucide-react";

/**
 * Navigation component with mobile menu
 */
export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 50;
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-[var(--z-fixed)] transition-all duration-300",
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-border-light shadow-sm"
            : "bg-white/80 backdrop-blur-md border-b border-border-light",
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">
                TravelAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-700 hover:text-primary-600 transition-colors duration-150 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu / Sign In */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors duration-150 font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-error-600 transition-colors duration-150 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-neutral-700 hover:text-primary-600 transition-colors duration-150 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="px-4 py-2 rounded-lg transition-colors duration-150 font-medium"
                    style={{ backgroundColor: "#111827", color: "#ffffff" }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </Container>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-slide-in-right">
            <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-border-light shadow-lg">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t border-border-light">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center space-x-2 px-3 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>{user?.name}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-neutral-700 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-150 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150 font-medium text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsRegisterModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-3 py-2 rounded-lg transition-colors duration-150 font-medium text-center"
                      style={{ backgroundColor: "#111827", color: "#ffffff" }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modals - rendered outside nav to avoid stacking context issues */}
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
    </>
  );
}
