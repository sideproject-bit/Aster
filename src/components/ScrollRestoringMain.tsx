"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "aster-scroll-positions";

// Persisted (not just in-memory) so a dev-mode Fast Refresh reload — or an
// actual page reload — doesn't wipe out where the user was scrolled to.
// Keyed by pathname, so each document remembers its own position independently.
function loadPositions(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePosition(pathname: string, scrollTop: number) {
  if (typeof window === "undefined") return;
  const positions = loadPositions();
  positions[pathname] = scrollTop;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // sessionStorage can throw in private-browsing edge cases — scroll
    // restoration just silently stops working, nothing else depends on it.
  }
}

let isPopNavigation = false;

if (typeof window !== "undefined") {
  // We're driving restoration ourselves; let the browser's own attempt (which
  // targets window scroll, not this custom-scrolling container) stay out of it.
  history.scrollRestoration = "manual";
  window.addEventListener("popstate", () => {
    isPopNavigation = true;
  });
}

// Wraps the wiki layout's scrollable <main>. On a back/forward navigation
// (Namuwiki-style), restores the scroll position the container had the last
// time that path was visited; on a fresh link click, starts at the top.
export function ScrollRestoringMain({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const wasPop = isPopNavigation;
    isPopNavigation = false;
    const target = wasPop ? (loadPositions()[pathname] ?? 0) : 0;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    function tryRestore() {
      if (!el) return;
      el.scrollTop = target;
      attempts += 1;
      // The document's real content arrives a beat after this effect runs
      // (fetched client-side), so the container may not be tall enough yet —
      // keep nudging for a bit until it is, or give up after a short while.
      // A timer (not requestAnimationFrame) so this still runs in a
      // backgrounded/inactive tab, where rAF callbacks are paused.
      if (Math.abs(el.scrollTop - target) > 1 && attempts < 20) {
        timer = setTimeout(tryRestore, 50);
      }
    }
    tryRestore();

    function handleScroll() {
      savePosition(pathname, el!.scrollTop);
    }
    el.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return (
    <main ref={ref} className="flex-1 overflow-y-auto">
      {children}
    </main>
  );
}
