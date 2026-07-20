import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { ThemeProviderWrapper } from "@/components/providers/ThemeProviderWrapper";
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
  description: "옵시디언과 나무위키를 결합한 개인 세계관 위키",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProviderWrapper>
          <ThemeProviderWrapper>
            <TopBar />
            <div className="flex flex-1 min-h-0">{children}</div>
          </ThemeProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
