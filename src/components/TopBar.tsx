"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { WikiSwitcher } from "./WikiSwitcher";
import { useLanguage } from "@/context/LanguageContext";

type WikiSummary = { id: string; title: string };

export function TopBar() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const params = useParams<{ wikiId?: string }>();
  const [wikis, setWikis] = useState<WikiSummary[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/wikis")
      .then((res) => res.json())
      .then(setWikis);
  }, [status]);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <Link
          href={status === "authenticated" ? "/wikis" : "/"}
          className="flex items-center gap-1.5 font-semibold"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Aster_logo_black.png" alt="Aster" className="h-6 w-6 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Aster_logo_yellow.png" alt="Aster" className="hidden h-6 w-6 dark:block" />
          Aster
        </Link>
        {params.wikiId && wikis.length > 0 && (
          <WikiSwitcher wikis={wikis} currentWikiId={params.wikiId} />
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <LanguageToggle />
        <ThemeToggle />
        {status === "authenticated" && session?.user ? (
          <>
            <span className="text-neutral-500">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              {t("topbar.logout")}
            </button>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Link href="/login" className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
              {t("topbar.login")}
            </Link>
            <Link href="/signup" className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
              {t("topbar.signup")}
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
