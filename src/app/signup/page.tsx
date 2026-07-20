"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const ERROR_KEYS: Record<string, string> = {
  missing_fields: "auth.error.missingFields",
  password_too_short: "auth.error.passwordTooShort",
  email_taken: "auth.error.emailTaken",
};

export default function SignupPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, lang }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(ERROR_KEYS[data.error] ? t(ERROR_KEYS[data.error]) : t("auth.signup.genericError"));
      setLoading(false);
      return;
    }
    const created = await res.json();

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push(created.demoWikiId ? `/w/${created.demoWikiId}` : "/wikis");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-8 py-16">
      <h1 className="text-2xl font-semibold">{t("auth.signup.title")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder={t("auth.nameOptional")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
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
          minLength={8}
          placeholder={t("auth.passwordHint")}
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
          {loading ? t("auth.signup.loading") : t("auth.signup.button")}
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        {t("auth.signup.haveAccount")}{" "}
        <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("auth.login.title")}
        </Link>
      </p>
    </div>
  );
}
