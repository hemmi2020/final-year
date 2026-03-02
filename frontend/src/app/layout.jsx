import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "TravelAI - AI-Powered Travel Planning",
  description:
    "Discover your perfect journey with AI-powered travel planning tailored to your unique style and preferences.",
  viewport: "width=device-width, initial-scale=1",
  keywords: ["travel", "AI", "trip planning", "destinations", "itinerary"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SmoothScrollProvider>
          <Navigation />
          <main className="pt-16 min-h-screen">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
