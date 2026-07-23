"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { JSONContent } from "@tiptap/react";
import { Editor } from "@/components/editor/Editor";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useDocuments, TagSummary } from "@/context/DocumentsContext";
import { collectFootnotes } from "@/lib/footnotes";
import { collectHeadings } from "@/lib/toc";
import { TableOfContents } from "@/components/TableOfContents";
import { DocumentCopyrightNotice } from "@/components/DocumentCopyrightNotice";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

type FullDocument = {
  id: string;
  title: string;
  content: JSONContent;
  tags: TagSummary[];
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

export default function ViewDocumentPage() {
  const { wikiId, docId } = useParams<{ wikiId: string; docId: string }>();
  const { childrenOf, docPath } = useDocuments();
  const { t, lang } = useLanguage();
  const { status: sessionStatus } = useSession();
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const [doc, setDoc] = useState<FullDocument | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const loading = !notFound && (!doc || doc.id !== docId);

  useEffect(() => {
    fetch(`/api/documents/${docId}`)
      .then(async (res) => {
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
      });
  }, [docId]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((bookmarks: { document: { id: string } }[]) => {
        setBookmarked(bookmarks.some((b) => b.document.id === docId));
      });
  }, [sessionStatus, docId]);

  async function toggleBookmark() {
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    if (bookmarked) {
      await fetch(`/api/bookmarks/${docId}`, { method: "DELETE" });
      setBookmarked(false);
    } else {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });
      setBookmarked(true);
    }
    setBookmarkBusy(false);
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

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Breadcrumb docId={doc.id} />

      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="flex-1 text-3xl font-bold">{doc.title}</h1>
        {sessionStatus === "authenticated" && (
          <button
            onClick={toggleBookmark}
            disabled={bookmarkBusy}
            className={`shrink-0 text-sm ${
              bookmarked
                ? "text-brand"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            {bookmarked ? t("view.bookmarked") : t("view.bookmark")}
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-divider bg-card-bg px-3 py-1.5 text-xs text-neutral-500">
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

      {doc.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
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
      )}

      <TableOfContents headings={headings} containerRef={editorContainerRef} />

      <Editor
        wikiId={wikiId}
        content={doc.content}
        onChange={() => {}}
        editable={false}
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

      <DocumentCopyrightNotice />
    </div>
  );
}
