"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  initialValue?: string;
  multiline?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export function PromptModal({ title, initialValue = "", multiline, onSubmit, onCancel }: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h3>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            rows={3}
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
              if (e.key === "Enter") submit();
            }}
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        )}
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            onClick={submit}
            className="rounded bg-brand px-3 py-1 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
