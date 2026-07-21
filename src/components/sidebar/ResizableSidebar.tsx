"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aster-sidebar-width";
const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 180;
const MAX_WIDTH = 480;

function clamp(value: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value));
}

export function ResizableSidebar({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    if (!Number.isNaN(parsed)) {
      const clamped = clamp(parsed);
      Promise.resolve().then(() => setWidth(clamped));
    }
  }, []);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    let latestWidth = startWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handleMove(ev: PointerEvent) {
      latestWidth = clamp(startWidth + (ev.clientX - startX));
      setWidth(latestWidth);
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.localStorage.setItem(STORAGE_KEY, String(latestWidth));
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <aside className="relative shrink-0 border-r border-divider" style={{ width }}>
      {children}
      <div
        onPointerDown={startDrag}
        className="absolute -right-1 top-0 h-full w-2 cursor-col-resize hover:bg-brand/30"
      />
    </aside>
  );
}
