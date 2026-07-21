"use client";

import { useEffect, useRef, useState } from "react";
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
  coverImageUrl: string | null;
  createdAt: string;
  role: "owner" | "editor";
  _count: { documents: number };
};

type ViewMode = "list" | "grid";

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
  const [view, setView] = useState<ViewMode>("list");
  const [uploadingCoverFor, setUploadingCoverFor] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    fetch("/api/wikis")
      .then((res) => res.json())
      .then(setWikis);
  }

  useEffect(refresh, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("aster-dashboard-view");
    if (stored === "grid" || stored === "list") Promise.resolve().then(() => setView(stored));
  }, []);

  function changeView(next: ViewMode) {
    setView(next);
    window.localStorage.setItem("aster-dashboard-view", next);
  }

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

  function requestCoverUpload(wikiId: string) {
    setUploadingCoverFor(wikiId);
    coverInputRef.current?.click();
  }

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const wikiId = uploadingCoverFor;
    e.target.value = "";
    setUploadingCoverFor(null);
    if (!file || !wikiId) return;

    const formData = new FormData();
    formData.append("wikiId", wikiId);
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) return;
    const { url } = await uploadRes.json();

    await fetch(`/api/wikis/${wikiId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImageUrl: url }),
    });
    refresh();
  }

  const owned = wikis?.filter((w) => w.role === "owner") ?? [];
  const collaborating = wikis?.filter((w) => w.role === "editor") ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFileChange}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("dashboard.myWikis")}</h1>
        <div className="flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => changeView("list")}
              className={`px-3 py-1 text-sm ${
                view === "list" ? "bg-brand text-brand-foreground" : "text-neutral-500"
              }`}
            >
              {t("dashboard.listView")}
            </button>
            <button
              onClick={() => changeView("grid")}
              className={`px-3 py-1 text-sm ${
                view === "grid" ? "bg-brand text-brand-foreground" : "text-neutral-500"
              }`}
            >
              {t("dashboard.gridView")}
            </button>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            {t("dashboard.newWiki")}
          </button>
        </div>
      </div>

      {wikis === null && <p className="text-sm text-neutral-400">{t("dashboard.loading")}</p>}
      {wikis?.length === 0 && (
        <p className="text-sm text-neutral-400">{t("dashboard.noWikisYet")}</p>
      )}

      {owned.length > 0 &&
        (view === "list" ? (
          <ul className="space-y-2">
            {owned.map((wiki) => (
              <li
                key={wiki.id}
                className="rounded-lg border border-divider bg-card-bg px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/w/${wiki.id}`} className="font-medium text-link hover:underline">
                      {wiki.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                      <span>{t("dashboard.docsCount", { count: wiki._count.documents })}</span>
                      <PublicBadge isPublic={wiki.isPublic} t={t} />
                    </div>
                  </div>
                  <WikiActions
                    wiki={wiki}
                    t={t}
                    onToggleCollaborators={() =>
                      setManagingCollaborators((v) => (v === wiki.id ? null : wiki.id))
                    }
                    onTogglePublic={() => togglePublic(wiki)}
                    onRename={() => setRenaming(wiki)}
                    onDelete={() => setDeleting(wiki)}
                  />
                </div>
                {managingCollaborators === wiki.id && <CollaboratorsPanel wikiId={wiki.id} />}
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {owned.map((wiki) => (
              <div key={wiki.id} className="flex flex-col">
                <FolderTabCard
                  wiki={wiki}
                  onOpen={() => router.push(`/w/${wiki.id}`)}
                  onUploadCover={() => requestCoverUpload(wiki.id)}
                  t={t}
                />
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <Link href={`/w/${wiki.id}`} className="text-sm font-medium text-link hover:underline">
                      {wiki.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                      <span>{t("dashboard.docsCount", { count: wiki._count.documents })}</span>
                      <PublicBadge isPublic={wiki.isPublic} t={t} />
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <WikiActions
                    wiki={wiki}
                    t={t}
                    compact
                    onToggleCollaborators={() =>
                      setManagingCollaborators((v) => (v === wiki.id ? null : wiki.id))
                    }
                    onTogglePublic={() => togglePublic(wiki)}
                    onRename={() => setRenaming(wiki)}
                    onDelete={() => setDeleting(wiki)}
                  />
                </div>
                {managingCollaborators === wiki.id && <CollaboratorsPanel wikiId={wiki.id} />}
              </div>
            ))}
          </div>
        ))}

      {collaborating.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">
            {t("dashboard.collaboratingWikis")}
          </h2>
          <ul className="space-y-2">
            {collaborating.map((wiki) => (
              <li
                key={wiki.id}
                className="flex items-center justify-between rounded-lg border border-divider bg-card-bg px-4 py-3"
              >
                <div>
                  <Link href={`/w/${wiki.id}`} className="font-medium text-link hover:underline">
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

function PublicBadge({ isPublic, t }: { isPublic: boolean; t: (key: string) => string }) {
  return (
    <span
      className={
        isPublic
          ? "rounded-full bg-brand px-1.5 py-0.5 text-brand-foreground"
          : "rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-500 dark:bg-neutral-800"
      }
    >
      {isPublic ? t("dashboard.public") : t("dashboard.private")}
    </span>
  );
}

function WikiActions({
  wiki,
  t,
  compact,
  onToggleCollaborators,
  onTogglePublic,
  onRename,
  onDelete,
}: {
  wiki: Wiki;
  t: (key: string) => string;
  compact?: boolean;
  onToggleCollaborators: () => void;
  onTogglePublic: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center text-neutral-500 ${
        compact ? "flex-wrap gap-2 text-xs" : "gap-3 text-sm"
      }`}
    >
      <button onClick={onToggleCollaborators} className="hover:text-neutral-800 dark:hover:text-neutral-200">
        {t("dashboard.collaborators")}
      </button>
      <button onClick={onTogglePublic} className="hover:text-neutral-800 dark:hover:text-neutral-200">
        {wiki.isPublic ? t("dashboard.makePrivate") : t("dashboard.makePublic")}
      </button>
      <button onClick={onRename} className="hover:text-neutral-800 dark:hover:text-neutral-200">
        {t("dashboard.rename")}
      </button>
      <button onClick={onDelete} className="hover:text-red-500">
        {t("dashboard.delete")}
      </button>
    </div>
  );
}

// A manila-folder-style card: a small tab above the top-left corner of the frame,
// evoking a physical archive/record folder. The frame holds a cover image (or a
// placeholder) and doubles as the "open this record" click target.
function FolderTabCard({
  wiki,
  onOpen,
  onUploadCover,
  t,
}: {
  wiki: Wiki;
  onOpen: () => void;
  onUploadCover: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="relative pt-2.5">
      <div className="absolute left-3 top-0 h-2.5 w-12 rounded-t-md border border-b-0 border-divider bg-card-bg" />
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-divider bg-card-bg">
        <button onClick={onOpen} className="absolute inset-0 flex h-full w-full items-center justify-center">
          {wiki.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={wiki.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-neutral-300 dark:text-neutral-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
              />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUploadCover();
          }}
          className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white hover:bg-black/80"
        >
          {wiki.coverImageUrl ? t("dashboard.changeCover") : t("dashboard.addCover")}
        </button>
      </div>
    </div>
  );
}
