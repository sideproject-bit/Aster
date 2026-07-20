"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  title: string;
  message: string;
  confirmText: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TypeToConfirmModal({
  title,
  message,
  confirmText,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const matches = value === confirmText;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h3>
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={confirmText}
          className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
