"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ORDER = ["system", "light", "dark"] as const;
const LABEL: Record<(typeof ORDER)[number], string> = {
  system: "시스템",
  light: "라이트",
  dark: "다크",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  const current = (mounted ? theme : "system") as (typeof ORDER)[number] | undefined;
  const index = ORDER.indexOf(current ?? "system");

  return (
    <button
      type="button"
      onClick={() => setTheme(ORDER[(index + 1) % ORDER.length])}
      title="테마 전환"
      className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
    >
      {mounted ? LABEL[current ?? "system"] : ""}
    </button>
  );
}
