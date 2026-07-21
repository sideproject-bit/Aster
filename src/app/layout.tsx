import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { ThemeProviderWrapper } from "@/components/providers/ThemeProviderWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import { TopBar } from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Decorative display font used only for the "Aster" wordmark, not body text.
const asterFont = localFont({
  src: "./fonts/Aster-Regular.ttf",
  variable: "--font-aster",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aster",
  description: "A personal wiki combining Obsidian-style editing with Namuwiki-style structure",
  icons: {
    icon: [
      { url: "/Aster_logo_black.png", media: "(prefers-color-scheme: light)" },
      { url: "/Aster_logo_yellow.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${asterFont.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <LanguageProvider>
          <SessionProviderWrapper>
            <ThemeProviderWrapper>
              <TopBar />
              <div className="flex flex-1">{children}</div>
            </ThemeProviderWrapper>
          </SessionProviderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
