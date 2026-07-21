"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { PromptModal } from "@/components/ui/PromptModal";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";

export function FootnoteView({ node, editor, getPos, updateAttributes }: NodeViewProps) {
  const { isOwner } = useDocuments();
  const { t } = useLanguage();
  const [index, setIndex] = useState(1);
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [editable, setEditable] = useState(editor.isEditable);
  const canEdit = isOwner && editable;
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function recompute() {
      const positions: number[] = [];
      editor.state.doc.descendants((n, pos) => {
        if (n.type.name === "footnote") positions.push(pos);
      });
      const myPos = getPos();
      const idx = typeof myPos === "number" ? positions.indexOf(myPos) : -1;
      setIndex(idx === -1 ? positions.length : idx + 1);
      setEditable(editor.isEditable);
    }
    recompute();
    editor.on("update", recompute);
    editor.on("selectionUpdate", recompute);
    return () => {
      editor.off("update", recompute);
      editor.off("selectionUpdate", recompute);
    };
  }, [editor, getPos]);

  useEffect(() => {
    if (!viewing) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setViewing(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [viewing]);

  function handleClick() {
    if (canEdit) {
      setEditing(true);
      return;
    }
    // Read-only (preview or non-owner): can't edit, but the content should still
    // be readable inline instead of doing nothing.
    setViewing((v) => !v);
  }

  return (
    <NodeViewWrapper as="span" ref={wrapperRef} className="relative inline">
      <sup>
        <button
          type="button"
          onClick={handleClick}
          title={canEdit ? t("footnote.editHint") : undefined}
          className={`px-0.5 text-link ${canEdit ? "hover:underline" : "hover:opacity-70"}`}
        >
          [{index}]
        </button>
      </sup>
      {viewing && !canEdit && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 w-56 whitespace-normal rounded-md border border-neutral-200 bg-white p-2 text-xs normal-case text-neutral-700 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
        >
          {node.attrs.text || t("doc.noFootnoteContent")}
        </span>
      )}
      {editing && canEdit && (
        <PromptModal
          title={t("footnote.promptTitle")}
          initialValue={node.attrs.text ?? ""}
          multiline
          onSubmit={(text) => {
            updateAttributes({ text });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </NodeViewWrapper>
  );
}
