import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AnimatedBackground } from "@/components/shell/AnimatedBackground";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { Providers } from "@/components/shell/Providers";
import { CommandPalette } from "@/components/shell/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NightGuard — Security Intelligence",
  description: "Intelligent Campus Night Security — Security Operations Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
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
