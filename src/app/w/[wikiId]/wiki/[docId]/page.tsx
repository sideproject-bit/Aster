"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { Editor } from "@/components/editor/Editor";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useDocuments, Status, TagSummary } from "@/context/DocumentsContext";
import { collectFootnotes } from "@/lib/footnotes";
import { collectHeadings } from "@/lib/toc";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TagPicker } from "@/components/tags/TagPicker";
import { TableOfContents } from "@/components/TableOfContents";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

type FullDocument = {
  id: string;
  title: string;
  content: JSONContent;
  status: Status;
  tags: TagSummary[];
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

function formatCardDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentPage() {
  const { wikiId, docId } = useParams<{ wikiId: string; docId: string }>();
  const router = useRouter();
  const { homePath, docPath, refresh, childrenOf } = useDocuments();
  const { t, lang } = useLanguage();

  const [doc, setDoc] = useState<FullDocument | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [wide, setWide] = useState(false);
  const loading = !notFound && (!doc || doc.id !== docId);

  useEffect(() => {
    const stored = window.localStorage.getItem("aster-content-width");
    if (stored === "wide") Promise.resolve().then(() => setWide(true));
  }, []);

  function toggleWide() {
    setWide((prev) => {
      const next = !prev;
      window.localStorage.setItem("aster-content-width", next ? "wide" : "normal");
      return next;
    });
  }

  useEffect(() => {
    fetch(`/api/documents/${docId}`)
      .then(async (res) => {
        setPreviewing(false);
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        setNotFound(false);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setDoc(data);
        setTitleDraft(data.title);
      });
  }, [docId]);

  const patchDoc = useCallback(
    async (body: Record<string, unknown>) => {
      setSaving(true);
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setSaving(false);
      return updated;
    },
    [docId]
  );

  const latestContent = useRef<JSONContent | null>(null);

  function handleContentChange(json: JSONContent) {
    latestContent.current = json;
    setDoc((prev) => (prev ? { ...prev, content: json } : prev));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      patchDoc({ content: json });
    }, 600);
  }

  function handleForceSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (latestContent.current) {
      patchDoc({ content: latestContent.current });
    }
  }

  async function handleTitleBlur() {
    const title = titleDraft.trim();
    if (!title || !doc || title === doc.title) return;
    const updated = await patchDoc({ title });
    setDoc((prev) => (prev ? { ...prev, title: updated.title } : prev));
    await refresh();
  }

  async function handleStatusChange(status: Status) {
    if (!doc) return;
    const updated = await patchDoc({ status });
    setDoc((prev) => (prev ? { ...prev, status: updated.status } : prev));
    await refresh();
  }

  async function handleTagsChange(tags: TagSummary[]) {
    setDoc((prev) => (prev ? { ...prev, tags } : prev));
    await patchDoc({ tagIds: tags.map((t) => t.id) });
    await refresh();
  }

  async function handleDelete() {
    if (!doc) return;
    await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    await refresh();
    router.push(homePath);
  }

  if (notFound) {
    return <div className="p-8 text-neutral-400">{t("doc.notFound")}</div>;
  }

  if (loading || !doc) {
    return <div className="p-8 text-neutral-400">{t("doc.loading")}</div>;
  }

  const footnotes = collectFootnotes(doc.content as Parameters<typeof collectFootnotes>[0]);
  const headings = collectHeadings(doc.content as Parameters<typeof collectHeadings>[0]);
  const kids = childrenOf(doc.id);
  const editingMode = doc.isOwner && !previewing;

  return (
    <div className={`mx-auto px-8 py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      <Breadcrumb docId={doc.id} />

      <div className="mb-4 flex items-start justify-between gap-4">
        {editingMode ? (
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.nativeEvent.isComposing && (e.currentTarget as HTMLInputElement).blur()
            }
            className="flex-1 border-none bg-transparent text-3xl font-bold outline-none"
          />
        ) : (
          <h1 className="flex-1 text-3xl font-bold">{doc.title}</h1>
        )}
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={toggleWide}
            className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            {wide ? t("doc.normal") : t("doc.wide")}
          </button>
          {doc.isOwner && (
            <>
              <button
                onClick={() => setPreviewing((v) => !v)}
                className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                {previewing ? t("doc.backToEdit") : t("doc.preview")}
              </button>
              {editingMode && (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="text-sm text-neutral-400 hover:text-red-500"
                >
                  {t("doc.delete")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {editingMode && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <StatusToggle status={doc.status} onChange={handleStatusChange} />
          <span className="text-neutral-300 dark:text-neutral-600">
            {saving ? t("doc.saving") : t("doc.saved")}
          </span>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-800">
        <span>
          <span className="uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
            {t("doc.card.filed")}
          </span>{" "}
          {formatCardDate(doc.createdAt, lang)}
        </span>
        <span>
          <span className="uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
            {t("doc.card.revised")}
          </span>{" "}
          {formatCardDate(doc.updatedAt, lang)}
        </span>
        <span>
          <span className="uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
            {t("doc.card.recordNo")}
          </span>{" "}
          <span className="font-mono">{doc.id.slice(-8).toUpperCase()}</span>
        </span>
      </div>

      {previewing && (
        <div className="mb-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {t("doc.previewBanner")}
        </div>
      )}

      <div className="mb-6">
        {editingMode ? (
          <TagPicker wikiId={wikiId} tags={doc.tags} onChange={handleTagsChange} />
        ) : (
          doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )
        )}
      </div>

      <TableOfContents headings={headings} containerRef={editorContainerRef} />

      <Editor
        wikiId={wikiId}
        content={doc.content}
        onChange={handleContentChange}
        onSave={handleForceSave}
        editable={editingMode}
        containerRef={editorContainerRef}
      />

      {footnotes.length > 0 && (
        <div className="mt-10 border-t border-divider pt-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("doc.footnotesTitle")}
          </h2>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-600 dark:text-neutral-400">
            {footnotes.map((text, i) => (
              <li key={i}>{text || t("doc.noFootnoteContent")}</li>
            ))}
          </ol>
        </div>
      )}

      {kids.length > 0 && (
        <div className="mt-10 border-t border-divider pt-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("doc.subdocsTitle")}
          </h2>
          <ul className="space-y-1">
            {kids.map((k) =>
              k.isFolder ? (
                <li key={k.id} className="text-neutral-500">
                  {k.title} <span className="text-xs">({t("doc.folderLabel")})</span>
                </li>
              ) : (
                <li key={k.id}>
                  <Link href={docPath(k.id)} className="text-link hover:underline">
                    {k.title}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmModal
          message={t("doc.deleteConfirm", { title: doc.title })}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}

function StatusToggle({
  status,
  onChange,
}: {
  status: Status;
  onChange: (status: Status) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
      <button
        onClick={() => onChange("DRAFT")}
        className={`px-3 py-1 ${
          status === "DRAFT"
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            : "text-neutral-500"
        }`}
      >
        {t("doc.statusDraft")}
      </button>
      <button
        onClick={() => onChange("PUBLISHED")}
        className={`px-3 py-1 ${
          status === "PUBLISHED" ? "bg-brand text-brand-foreground" : "text-neutral-500"
        }`}
      >
        {t("doc.statusPublished")}
      </button>
    </div>
  );
}
