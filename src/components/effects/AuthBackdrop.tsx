"use client";

import { MeteorShower } from "./MeteorShower";
import { PageEntrance } from "./PageEntrance";

// Shared background for unauthenticated pages (landing, login, signup,
// forgot/reset password): a meteor shower behind a fade-in-slide-up entrance.
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <MeteorShower />
      <PageEntrance className="relative flex flex-1 flex-col">{children}</PageEntrance>
    </div>
  );
}
