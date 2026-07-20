"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const ERROR_KEYS: Record<string, string> = {
  invalid_token: "resetPassword.invalidToken",
  password_too_short: "auth.error.passwordTooShort",
};

function ResetPasswordForm() {
  const { t } = useLanguage();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(ERROR_KEYS[data.error] ? t(ERROR_KEYS[data.error]) : t("resetPassword.genericError"));
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-8 py-16">
      <h1 className="text-2xl font-semibold">{t("resetPassword.title")}</h1>
      {success ? (
        <p className="text-sm text-neutral-500">{t("resetPassword.success")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={8}
            placeholder={t("auth.passwordHint")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="rounded bg-brand px-3 py-2 font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("resetPassword.resetting") : t("resetPassword.submit")}
          </button>
        </form>
      )}
      <p className="text-sm text-neutral-500">
        <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("forgotPassword.backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
