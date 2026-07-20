"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TAG_COLORS } from "@/lib/tagColors";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  label: ReactNode;
  title: string;
  onPick: (color: string | null) => void;
};

export function ColorSwatches({ label, title, onPick }: Props) {
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
        title={title}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <button
            type="button"
            title={t("editor.noColor")}
            onClick={() => {
              onPick(null);
              setOpen(false);
            }}
            className="h-5 w-5 rounded-full border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800"
          >
            ×
          </button>
          {TAG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onPick(color);
                setOpen(false);
              }}
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
