import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/shell/Providers";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { AnimatedBackground } from "@/components/shell/AnimatedBackground";

export const metadata: Metadata = {
  title: "NightGuard — Safest Route, Intelligently",
  description:
    "An intelligent route safety recommendation platform powered by real-time IoT sensor nodes. Find the safest path between any two places.",
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-canvas">
        <Providers>
          <AnimatedBackground />
          <div className="relative flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[256px]">
              <Topbar />
              <main className="dot-bg min-h-[calc(100vh-72px)] flex-1">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
