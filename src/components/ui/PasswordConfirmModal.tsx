"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  loadingLabel: string;
  onSubmit: (password: string) => Promise<{ error?: string } | void>;
  onCancel: () => void;
};

export function PasswordConfirmModal({
  title,
  message,
  confirmLabel,
  loadingLabel,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    const result = await onSubmit(password);
    setLoading(false);
    if (result?.error) setError(result.error);
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
        <h3 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h3>
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && submit()}
          className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={submit}
            disabled={!password || loading}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
