"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";

export function WikiLinkView({ node, updateAttributes }: NodeViewProps) {
  const router = useRouter();
  const { wikiId, isOwner, refresh } = useDocuments();
  const { t } = useLanguage();
  const [creating, setCreating] = useState(false);
  const docId: string | null = node.attrs.docId;
  const label: string = node.attrs.label;
  // Older content saved before the `title` attribute existed only has `label`.
  const title: string = node.attrs.title ?? label;
  const exists = !!docId;

  async function handleClick() {
    if (exists) {
      router.push(`/w/${wikiId}/wiki/${docId}`);
      return;
    }
    if (!isOwner || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wikiId, title }),
      });
      const created = await res.json();
      updateAttributes({ docId: created.id });
      await refresh();
      router.push(`/w/${wikiId}/wiki/${created.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <NodeViewWrapper as="span" className="inline">
      <button
        type="button"
        onClick={handleClick}
        disabled={!exists && !isOwner}
        className={
          exists
            ? "text-blue-600 dark:text-blue-400 hover:underline decoration-1"
            : "text-red-500 dark:text-red-400 border-b border-dashed border-red-400 hover:opacity-80 disabled:opacity-60"
        }
        title={
          exists
            ? title
            : t("wikiLink.notCreatedHint", { title }) + (isOwner ? t("wikiLink.clickToCreate") : "")
        }
      >
        {label}
      </button>
    </NodeViewWrapper>
  );
}
