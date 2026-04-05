import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "TravelAI - AI-Powered Travel Planning",
  description:
    "Discover your perfect journey with AI-powered travel planning tailored to your unique style and preferences.",
  keywords: ["travel", "AI", "trip planning", "destinations", "itinerary"],
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
          <SmoothScrollProvider>
            <Navigation />
            <main style={{ paddingTop: 64, minHeight: "100vh" }}>
              {children}
            </main>
            <Footer />
          </SmoothScrollProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
