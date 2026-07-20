"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PromptModal } from "@/components/ui/PromptModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CollaboratorsPanel } from "@/components/CollaboratorsPanel";
import { useLanguage } from "@/context/LanguageContext";

type Wiki = {
  id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  role: "owner" | "editor";
  _count: { documents: number };
};

export function WikisDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [wikis, setWikis] = useState<Wiki[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Wiki | null>(null);
  const [deleting, setDeleting] = useState<Wiki | null>(null);
  const [leaving, setLeaving] = useState<Wiki | null>(null);
  const [managingCollaborators, setManagingCollaborators] = useState<string | null>(null);

  function refresh() {
    fetch("/api/wikis")
      .then((res) => res.json())
      .then(setWikis);
  }

  useEffect(refresh, []);

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

  async function renameWiki(title: string) {
    if (!renaming) return;
    await fetch(`/api/wikis/${renaming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setRenaming(null);
    refresh();
  }

  async function togglePublic(wiki: Wiki) {
    await fetch(`/api/wikis/${wiki.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !wiki.isPublic }),
    });
    refresh();
  }

  async function deleteWiki() {
    if (!deleting) return;
    await fetch(`/api/wikis/${deleting.id}`, { method: "DELETE" });
    setDeleting(null);
    refresh();
  }

  async function leaveWiki() {
    if (!leaving || !session?.user?.id) return;
    await fetch(`/api/wikis/${leaving.id}/collaborators/${session.user.id}`, {
      method: "DELETE",
    });
    setLeaving(null);
    refresh();
  }

  const owned = wikis?.filter((w) => w.role === "owner") ?? [];
  const collaborating = wikis?.filter((w) => w.role === "editor") ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("dashboard.myWikis")}</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          {t("dashboard.newWiki")}
        </button>
      </div>

      {wikis === null && <p className="text-sm text-neutral-400">{t("dashboard.loading")}</p>}
      {wikis?.length === 0 && (
        <p className="text-sm text-neutral-400">{t("dashboard.noWikisYet")}</p>
      )}

      {owned.length > 0 && (
        <ul className="space-y-2">
          {owned.map((wiki) => (
            <li
              key={wiki.id}
              className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/w/${wiki.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {wiki.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                    <span>{t("dashboard.docsCount", { count: wiki._count.documents })}</span>
                    <span
                      className={
                        wiki.isPublic
                          ? "rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-500 dark:bg-neutral-800"
                      }
                    >
                      {wiki.isPublic ? t("dashboard.public") : t("dashboard.private")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <button
                    onClick={() =>
                      setManagingCollaborators((v) => (v === wiki.id ? null : wiki.id))
                    }
                    className="hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    {t("dashboard.collaborators")}
                  </button>
                  <button
                    onClick={() => togglePublic(wiki)}
                    className="hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    {wiki.isPublic ? t("dashboard.makePrivate") : t("dashboard.makePublic")}
                  </button>
                  <button
                    onClick={() => setRenaming(wiki)}
                    className="hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    {t("dashboard.rename")}
                  </button>
                  <button onClick={() => setDeleting(wiki)} className="hover:text-red-500">
                    {t("dashboard.delete")}
                  </button>
                </div>
              </div>
              {managingCollaborators === wiki.id && <CollaboratorsPanel wikiId={wiki.id} />}
            </li>
          ))}
        </ul>
      )}

      {collaborating.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">
            {t("dashboard.collaboratingWikis")}
          </h2>
          <ul className="space-y-2">
            {collaborating.map((wiki) => (
              <li
                key={wiki.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
              >
                <div>
                  <Link
                    href={`/w/${wiki.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {wiki.title}
                  </Link>
                  <div className="mt-0.5 text-xs text-neutral-400">
                    {t("dashboard.docsCount", { count: wiki._count.documents })}
                  </div>
                </div>
                <button onClick={() => setLeaving(wiki)} className="text-sm text-neutral-500 hover:text-red-500">
                  {t("dashboard.leave")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {creating && (
        <PromptModal
          title={t("dashboard.newWikiPrompt")}
          onSubmit={createWiki}
          onCancel={() => setCreating(false)}
        />
      )}
      {renaming && (
        <PromptModal
          title={t("dashboard.renamePrompt")}
          initialValue={renaming.title}
          onSubmit={renameWiki}
          onCancel={() => setRenaming(null)}
        />
      )}
      {deleting && (
        <ConfirmModal
          message={t("dashboard.deleteConfirm", { title: deleting.title })}
          onConfirm={deleteWiki}
          onCancel={() => setDeleting(null)}
        />
      )}
      {leaving && (
        <ConfirmModal
          message={t("dashboard.leaveConfirm", { title: leaving.title })}
          confirmLabel={t("dashboard.leave")}
          onConfirm={leaveWiki}
          onCancel={() => setLeaving(null)}
        />
      )}
    </div>
  );
}
