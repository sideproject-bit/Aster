"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type ContextMenuItem =
  | {
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      danger?: boolean;
    }
  | { separator: true }
  | { custom: ReactNode };

type Props = {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
};

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y, visible: false });

  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - rect.width - 8);
    const clampedY = Math.min(y, window.innerHeight - rect.height - 8);
    setPos({ x: Math.max(8, clampedX), y: Math.max(8, clampedY), visible: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y, opacity: pos.visible ? 1 : 0 }}
      className="fixed z-50 min-w-[170px] rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      {items.map((item, i) => {
        if ("separator" in item) {
          return (
            <div key={i} className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
          );
        }
        if ("custom" in item) {
          return <div key={i}>{item.custom}</div>;
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              item.danger ? "text-red-500" : ""
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
