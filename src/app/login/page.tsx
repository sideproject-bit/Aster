"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t("auth.login.invalidCredentials"));
      return;
    }
    router.push("/wikis");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-8 py-16">
      <h1 className="text-2xl font-semibold">{t("auth.login.title")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
        <input
          type="password"
          required
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand px-3 py-2 font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("auth.login.loading") : t("auth.login.button")}
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        {t("auth.login.noAccount")}{" "}
        <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("auth.signup.title")}
        </Link>
      </p>
    </div>
  );
}
