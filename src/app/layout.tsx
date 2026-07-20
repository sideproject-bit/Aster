import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <SessionProviderWrapper>
            <ThemeProviderWrapper>
              <TopBar />
              <div className="flex flex-1 min-h-0">{children}</div>
            </ThemeProviderWrapper>
          </SessionProviderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
