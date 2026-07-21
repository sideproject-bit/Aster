"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { AuthBackdrop } from "@/components/effects/AuthBackdrop";

export function LandingHero() {
  const { t } = useLanguage();
  return (
    <AuthBackdrop>
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Aster_logo_black.png" alt="Aster" className="mb-4 h-16 w-16 dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Aster_logo_yellow.png"
          alt="Aster"
          className="mb-4 hidden h-16 w-16 dark:block"
        />
        <h1 className="font-aster mb-2 text-4xl">Aster</h1>
        <p className="mb-6 max-w-md text-neutral-500">{t("landing.tagline")}</p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded bg-brand px-4 py-2 font-medium text-brand-foreground hover:opacity-90"
          >
            {t("landing.login")}
          </Link>
          <Link
            href="/signup"
            className="rounded border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {t("landing.signup")}
          </Link>
        </div>
      </div>
    </AuthBackdrop>
  );
}
