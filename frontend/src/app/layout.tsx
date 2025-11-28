import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
