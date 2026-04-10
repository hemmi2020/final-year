import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { ToastProvider } from "@/components/ui/Toast";
import LoadingBar from "@/components/ui/LoadingBar";
import ScrollToTop from "@/components/ui/ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "TravelAI - AI-Powered Travel Planning",
  description:
    "Discover your perfect journey with AI-powered travel planning tailored to your unique style and preferences.",
  keywords: [
    "travel",
    "AI",
    "trip planning",
    "destinations",
    "itinerary",
    "halal",
    "budget",
  ],
  openGraph: {
    title: "TravelAI - AI-Powered Travel Planning",
    description:
      "Plan your dream trip in seconds with AI that understands your dietary needs, budget, and style.",
    type: "website",
    siteName: "TravelAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelAI",
    description: "AI-powered travel planning tailored to your style.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
        <ToastProvider>
          <LoadingBar />
          <SmoothScrollProvider>
            <Navigation />
            <main style={{ minHeight: "100vh", margin: 0, padding: 0 }}>
              {children}
            </main>
            <Footer />
            <ScrollToTop />
          </SmoothScrollProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
