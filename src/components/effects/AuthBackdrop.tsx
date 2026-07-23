"use client";

import { CosmicBackground } from "./CosmicBackground";
import { PageEntrance } from "./PageEntrance";
import { SiteFooter } from "@/components/SiteFooter";

// Shared background for unauthenticated pages (landing, login, signup,
// forgot/reset password): a cosmic night-sky scene behind a fade-in-slide-up entrance.
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <CosmicBackground />
      <PageEntrance className="relative flex flex-1 flex-col">
        {children}
        <SiteFooter pinBottom />
      </PageEntrance>
    </div>
  );
}
