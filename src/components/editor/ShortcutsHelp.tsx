"use client";

import { useEffect, useRef, useState } from "react";

const SHORTCUTS: [string, string][] = [
  ["Ctrl/⌘ + B", "굵게"],
  ["Ctrl/⌘ + I", "기울임"],
  ["Ctrl/⌘ + Alt + 2", "제목(H2)"],
  ["Ctrl/⌘ + Alt + 3", "소제목(H3)"],
  ["Ctrl/⌘ + Alt + 4", "소제목(H4)"],
  ["Ctrl/⌘ + Alt + 5", "소제목(H5)"],
  ["Ctrl/⌘ + Shift + 8", "글머리 목록"],
  ["Ctrl/⌘ + Shift + B", "인용"],
  ["Ctrl/⌘ + Z", "실행 취소"],
  ["Ctrl/⌘ + Shift + Z", "다시 실행"],
  ["[[", "문서 링크 삽입"],
  ["Ctrl/⌘ + K", "문서 링크 삽입 (커서 위치)"],
  ["Ctrl/⌘ + S", "즉시 저장"],
];

export function ShortcutsHelp() {
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
        title="단축키"
        onClick={() => setOpen((v) => !v)}
        className="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        단축키
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <ul className="space-y-1.5">
            {SHORTCUTS.map(([keys, label]) => (
              <li key={keys} className="flex items-center justify-between gap-3">
                <span className="text-neutral-500">{label}</span>
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
