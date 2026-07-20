"use client";

import Link from "next/link";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";

export function Breadcrumb({ docId }: { docId: string }) {
  const { wikiId, ancestors } = useDocuments();
  const { t } = useLanguage();
  const chain = ancestors(docId);

  if (chain.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-neutral-500 mb-3 flex-wrap">
      <Link
        href={`/w/${wikiId}`}
        className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        {t("breadcrumb.home")}
      </Link>
      {chain.map((doc) => (
        <span key={doc.id} className="flex items-center gap-1">
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          {doc.id === docId ? (
            <span className="text-neutral-800 dark:text-neutral-200 font-medium">
              {doc.title}
            </span>
          ) : (
            <Link
              href={`/w/${wikiId}/wiki/${doc.id}`}
              className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              {doc.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
