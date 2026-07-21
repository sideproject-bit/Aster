"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDocuments, DocumentSummary } from "@/context/DocumentsContext";
import { FolderIcon, DocIcon } from "@/components/sidebar/icons";
import { useLanguage } from "@/context/LanguageContext";

function ViewTreeNode({ doc, depth }: { doc: DocumentSummary; depth: number }) {
  const { childrenOf, docPath } = useDocuments();
  const params = useParams<{ docId?: string }>();
  const kids = childrenOf(doc.id);
  const isActive = params.docId === doc.id;

  return (
    <div>
      {doc.isFolder ? (
        <div
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-neutral-500"
          style={{ paddingLeft: depth * 14 + 8 }}
        >
          <FolderIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{doc.title}</span>
        </div>
      ) : (
        <Link
          href={docPath(doc.id)}
          className={`flex items-center gap-1.5 rounded px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
            isActive ? "bg-brand/20 font-medium dark:bg-brand/25" : ""
          }`}
          style={{ paddingLeft: depth * 14 + 8 }}
        >
          <DocIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <span className="truncate">{doc.title}</span>
        </Link>
      )}
      {kids.map((child) => (
        <ViewTreeNode key={child.id} doc={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ViewSidebar() {
  const { childrenOf, loading } = useDocuments();
  const { t } = useLanguage();
  const roots = childrenOf(null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-card-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {t("sidebar.documents")}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {loading && <div className="px-3 text-sm text-neutral-400">{t("common.loading")}</div>}
        {!loading && roots.length === 0 && (
          <div className="px-3 text-sm text-neutral-400">{t("view.noDocuments")}</div>
        )}
        {roots.map((doc) => (
          <ViewTreeNode key={doc.id} doc={doc} depth={0} />
        ))}
      </div>
    </div>
  );
}
