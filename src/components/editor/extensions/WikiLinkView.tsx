"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";
import { PromptModal } from "@/components/ui/PromptModal";
import { PencilIcon } from "@/components/sidebar/icons";

export function WikiLinkView({ node, editor, updateAttributes }: NodeViewProps) {
  const router = useRouter();
  const { wikiId, isOwner, docPath, refresh } = useDocuments();
  const { t } = useLanguage();
  const [creating, setCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [editable, setEditable] = useState(editor.isEditable);
  const canEdit = isOwner && editable;
  const docId: string | null = node.attrs.docId;
  const label: string = node.attrs.label;
  // Older content saved before the `title` attribute existed only has `label`.
  const title: string = node.attrs.title ?? label;
  const exists = !!docId;

  useEffect(() => {
    function recompute() {
      setEditable(editor.isEditable);
    }
    editor.on("update", recompute);
    return () => {
      editor.off("update", recompute);
    };
  }, [editor]);

  async function handleClick() {
    if (exists) {
      router.push(docPath(docId));
      return;
    }
    if (!canEdit || creating) return;
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
      router.push(docPath(created.id));
    } finally {
      setCreating(false);
    }
  }

  return (
    <NodeViewWrapper as="span" className="group relative inline">
      <button
        type="button"
        onClick={handleClick}
        disabled={!exists && !canEdit}
        className={
          exists
            ? "text-link hover:underline decoration-1"
            : "text-red-500 dark:text-red-400 border-b border-dashed border-red-400 hover:opacity-80 disabled:opacity-60"
        }
        title={
          exists
            ? title
            : t("wikiLink.notCreatedHint", { title }) + (canEdit ? t("wikiLink.clickToCreate") : "")
        }
      >
        {label}
      </button>
      {canEdit && (
        <button
          type="button"
          contentEditable={false}
          onClick={(e) => {
            e.stopPropagation();
            setEditingLabel(true);
          }}
          title={t("wikiLink.editLabelHint")}
          className="ml-0.5 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <PencilIcon className="inline h-3 w-3" />
        </button>
      )}
      {editingLabel && (
        <PromptModal
          title={t("wikiLink.editLabelPromptTitle")}
          initialValue={label}
          onSubmit={(newLabel) => {
            updateAttributes({ label: newLabel });
            setEditingLabel(false);
          }}
          onCancel={() => setEditingLabel(false)}
        />
      )}
    </NodeViewWrapper>
  );
}
