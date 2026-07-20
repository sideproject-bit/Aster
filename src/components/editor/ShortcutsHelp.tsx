"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const SHORTCUT_KEYS: [string, string][] = [
  ["Ctrl/⌘ + B", "shortcuts.bold"],
  ["Ctrl/⌘ + I", "shortcuts.italic"],
  ["Ctrl/⌘ + Alt + 2", "shortcuts.h2"],
  ["Ctrl/⌘ + Alt + 3", "shortcuts.h3"],
  ["Ctrl/⌘ + Alt + 4", "shortcuts.h4"],
  ["Ctrl/⌘ + Alt + 5", "shortcuts.h5"],
  ["Ctrl/⌘ + Shift + 8", "shortcuts.bulletList"],
  ["Ctrl/⌘ + Shift + B", "shortcuts.quote"],
  ["Ctrl/⌘ + Z", "shortcuts.undo"],
  ["Ctrl/⌘ + Shift + Z", "shortcuts.redo"],
  ["[[", "shortcuts.wikiLink"],
  ["Ctrl/⌘ + K", "shortcuts.wikiLinkCursor"],
  ["Ctrl/⌘ + S", "shortcuts.save"],
];

export function ShortcutsHelp() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={t("shortcuts.title")}
        onClick={() => setOpen((v) => !v)}
        className="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        {t("shortcuts.title")}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <ul className="space-y-1.5">
            {SHORTCUT_KEYS.map(([keys, labelKey]) => (
              <li key={keys} className="flex items-center justify-between gap-3">
                <span className="text-neutral-500">{t(labelKey)}</span>
                <kbd className="rounded border border-neutral-300 bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {keys}
                </kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
