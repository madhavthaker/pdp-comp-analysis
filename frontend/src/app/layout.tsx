import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthButton } from "@/components/AuthButton";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PDP Analyzer – Competitive Intelligence for Product Pages",
  description: "Discover how your product pages stack up against the best. AI-powered competitive analysis that reveals actionable insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-canvas-100">
        {/* Subtle noise texture */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Header with auth */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-canvas-50 backdrop-blur-md border-b border-canvas-300 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-end">
            <AuthButton />
          </div>
        </header>
        
        {/* Main content with padding for fixed header */}
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
