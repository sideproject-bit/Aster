"use client";

import Link from "next/link";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";

export function ViewWikiHome({ wikiTitle }: { wikiTitle: string }) {
  const { documents, loading, docPath } = useDocuments();
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold">{wikiTitle}</h1>
      <p className="mb-6 max-w-md text-neutral-500">{t("view.wikiHomeHint")}</p>
      {!loading && documents.length > 0 && (
        <ul className="w-full max-w-sm space-y-1 text-left">
          {documents
            .filter((d) => !d.parentId && !d.isFolder)
            .map((d) => (
              <li key={d.id}>
                <Link href={docPath(d.id)} className="text-link hover:underline">
                  {d.title}
                </Link>
              </li>
            ))}
        </ul>
      )}
      {!loading && documents.length === 0 && (
        <p className="text-sm text-neutral-400">{t("view.noDocuments")}</p>
      )}
    </div>
  );
}
