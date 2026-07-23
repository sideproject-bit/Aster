"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { SiteFooter } from "@/components/SiteFooter";

type Bookmark = {
  id: string;
  document: {
    id: string;
    title: string;
    wiki: { id: string; title: string; isPublic: boolean };
  };
};

// Accepts a full pasted URL (.../view/<wikiId>[/<docId>]) or a bare wiki id,
// and returns the path to navigate to.
function parseViewLink(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/\/view\/([^/?#]+)(?:\/([^/?#]+))?/);
  if (match) {
    const [, wikiId, docId] = match;
    return docId ? `/view/${wikiId}/${docId}` : `/view/${wikiId}`;
  }
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return `/view/${trimmed}`;
  }
  return null;
}

export default function ViewLandingPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { t } = useLanguage();
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then(setBookmarks);
  }, [sessionStatus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const path = parseViewLink(link);
    if (!path) {
      setError(true);
      return;
    }
    setError(false);
    router.push(path);
  }

  async function removeBookmark(documentId: string) {
    setBookmarks((prev) => prev?.filter((b) => b.document.id !== documentId) ?? null);
    await fetch(`/api/bookmarks/${documentId}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-8 py-16">
      <Link
        href={sessionStatus === "authenticated" ? "/wikis" : "/"}
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        {t("view.backHome")}
      </Link>
      <h1 className="mb-2 text-2xl font-semibold">{t("view.landingTitle")}</h1>
      <p className="mb-6 text-neutral-500">{t("view.landingHint")}</p>

      <form onSubmit={handleSubmit} className="mb-10 flex gap-2">
        <input
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setError(false);
          }}
          placeholder={t("view.linkPlaceholder")}
          className="flex-1 rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700"
        />
        <button
          type="submit"
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          {t("view.go")}
        </button>
      </form>
      {error && <p className="-mt-8 mb-8 text-sm text-red-500">{t("view.linkInvalid")}</p>}

      {sessionStatus === "authenticated" && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">{t("view.bookmarksTitle")}</h2>
          {bookmarks === null && <p className="text-sm text-neutral-400">{t("dashboard.loading")}</p>}
          {bookmarks?.length === 0 && (
            <p className="text-sm text-neutral-400">{t("view.noBookmarks")}</p>
          )}
          {bookmarks && bookmarks.length > 0 && (
            <ul className="space-y-2">
              {bookmarks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-divider bg-card-bg px-4 py-3"
                >
                  <div>
                    <Link
                      href={`/view/${b.document.wiki.id}/${b.document.id}`}
                      className="font-medium text-link hover:underline"
                    >
                      {b.document.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-neutral-400">{b.document.wiki.title}</div>
                  </div>
                  <button
                    onClick={() => removeBookmark(b.document.id)}
                    className="text-sm text-neutral-500 hover:text-red-500"
                  >
                    {t("view.removeBookmark")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
