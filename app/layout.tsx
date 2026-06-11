import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AnimatedBackground } from "@/components/shell/AnimatedBackground";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { Providers } from "@/components/shell/Providers";
import { CommandPalette } from "@/components/shell/CommandPalette";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NightGuard — Security Intelligence",
  description: "Intelligent Campus Night Security — Security Operations Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark bg-surface-0 ${grotesk.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <AnimatedBackground />
          <CommandPalette />
          <div className="min-h-screen">
            <Sidebar />
            <div className="lg:pl-[248px]">
              <Topbar />
              <div className="grid-bg min-h-[calc(100vh-64px)]">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
