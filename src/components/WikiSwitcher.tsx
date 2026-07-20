"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { PromptModal } from "@/components/ui/PromptModal";

type WikiSummary = { id: string; title: string };

type Props = {
  wikis: WikiSummary[];
  currentWikiId: string;
};

export function WikiSwitcher({ wikis, currentWikiId }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = wikis.find((w) => w.id === currentWikiId);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function createWiki(title: string) {
    const res = await fetch("/api/wikis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const created = await res.json();
    setCreating(false);
    router.push(`/w/${created.id}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="max-w-48 truncate rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
      >
        {current?.title ?? ""}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="max-h-64 overflow-y-auto">
            {wikis.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/w/${w.id}`);
                }}
                className={`flex w-full items-center truncate px-3 py-1.5 text-left ${
                  w.id === currentWikiId
                    ? "bg-neutral-100 font-medium dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                {w.title}
              </button>
            ))}
          </div>
          <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
          <Link
            href="/wikis"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
          >
            {t("topbar.viewAllWikis")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreating(true);
            }}
            className="block w-full px-3 py-1.5 text-left text-brand hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
          >
            + {t("topbar.newWiki")}
          </button>
        </div>
      )}
      {creating && (
        <PromptModal
          title={t("dashboard.newWikiPrompt")}
          onSubmit={createWiki}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  );
}
