"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useEffect, useState } from "react";
import { PromptModal } from "@/components/ui/PromptModal";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";

export function FootnoteView({ node, editor, getPos, updateAttributes }: NodeViewProps) {
  const { isOwner } = useDocuments();
  const { t } = useLanguage();
  const [index, setIndex] = useState(1);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    function recompute() {
      const positions: number[] = [];
      editor.state.doc.descendants((n, pos) => {
        if (n.type.name === "footnote") positions.push(pos);
      });
      const myPos = getPos();
      const idx = typeof myPos === "number" ? positions.indexOf(myPos) : -1;
      setIndex(idx === -1 ? positions.length : idx + 1);
    }
    recompute();
    editor.on("update", recompute);
    editor.on("selectionUpdate", recompute);
    return () => {
      editor.off("update", recompute);
      editor.off("selectionUpdate", recompute);
    };
  }, [editor, getPos]);

  return (
    <NodeViewWrapper as="span" className="inline">
      <sup>
        <button
          type="button"
          onClick={() => isOwner && setEditing(true)}
          title={node.attrs.text || (isOwner ? t("footnote.editHint") : undefined)}
          className={`px-0.5 text-blue-600 dark:text-blue-400 ${isOwner ? "hover:underline" : ""}`}
        >
          [{index}]
        </button>
      </sup>
      {editing && isOwner && (
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
