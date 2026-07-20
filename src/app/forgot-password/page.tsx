"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-8 py-16">
      <h1 className="text-2xl font-semibold">{t("forgotPassword.title")}</h1>
      {sent ? (
        <p className="text-sm text-neutral-500">{t("forgotPassword.sent")}</p>
      ) : (
        <>
          <p className="text-sm text-neutral-500">{t("forgotPassword.body")}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-brand px-3 py-2 font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t("forgotPassword.sending") : t("forgotPassword.submit")}
            </button>
          </form>
        </>
      )}
      <p className="text-sm text-neutral-500">
        <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("forgotPassword.backToLogin")}
        </Link>
      </p>
    </div>
  );
}
