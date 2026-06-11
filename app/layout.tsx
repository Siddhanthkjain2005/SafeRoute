import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AnimatedBackground } from "@/components/shell/AnimatedBackground";
import { Navbar } from "@/components/shell/Navbar";
import { Providers } from "@/components/shell/Providers";
import { CommandPalette } from "@/components/shell/CommandPalette";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NightGuard — Find your safest route",
  description:
    "An intelligent route safety platform powered by IoT sensor nodes. NightGuard recommends the safest path between two places using real-time environmental risk analysis.",
};

export const viewport: Viewport = {
  themeColor: "#f7f8fc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-surface-0`}>
      <body className="bg-surface-0">
        <Providers>
          <AnimatedBackground />
          <CommandPalette />
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
