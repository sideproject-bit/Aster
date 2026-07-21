"use client";

import { NodeViewWrapper, EditorContent, useEditor, type NodeViewProps, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { useDocuments } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";
import { WikiLink } from "./WikiLink";
import { BoldIcon, ItalicIcon, LinkIcon } from "../icons";

const EMPTY_FOOTNOTE_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
const TOOLTIP_WIDTH = 224;

function extractPlainText(node?: JSONContent | null): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(extractPlainText).join("");
}

// Documents saved before footnotes supported rich content stored plain text
// in `attrs.text`; wrap it as a one-paragraph doc so old footnotes still show
// their content instead of appearing empty.
function legacyTextToContent(text: string): JSONContent {
  return { type: "doc", content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }] };
}

// Keeps the hover preview inside the viewport horizontally, however close the
// marker sits to the right edge — the previous CSS-only `left-0` positioning
// could push the tooltip past the content column and force a horizontal
// scrollbar on the whole page.
function computeTooltipPosition(trigger: HTMLElement): { left: number; top: number } {
  const rect = trigger.getBoundingClientRect();
  const margin = 8;
  let left = rect.left;
  if (left + TOOLTIP_WIDTH > window.innerWidth - margin) {
    left = window.innerWidth - TOOLTIP_WIDTH - margin;
  }
  if (left < margin) left = margin;
  return { left, top: rect.bottom + 4 };
}

export function FootnoteView({ node, editor, getPos, updateAttributes }: NodeViewProps) {
  const { isOwner, wikiId } = useDocuments();
  const { t } = useLanguage();
  const [index, setIndex] = useState(1);
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const [editable, setEditable] = useState(editor.isEditable);
  const canEdit = isOwner && editable;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const legacyText: string | null = typeof node.attrs.text === "string" ? node.attrs.text : null;
  const content: JSONContent | null =
    node.attrs.content ?? (legacyText !== null ? legacyTextToContent(legacyText) : null);
  const plainText = extractPlainText(content);

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

  // A self-contained nested editor for the footnote's own rich body — kept
  // separate from the outer document's node tree (the footnote marker itself
  // stays atomic) so normal arrow-key/cursor navigation in the main document
  // never wanders into content that's only visible inside this popup.
  const miniEditor = useEditor(
    {
      immediatelyRender: false,
      editable: canEdit,
      extensions: [StarterKit.configure({ heading: false }), WikiLink.configure({ wikiId })],
      content: content ?? EMPTY_FOOTNOTE_DOC,
      editorProps: {
        attributes: { class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[4rem]" },
      },
      onUpdate({ editor: mini }) {
        updateAttributes({ content: mini.getJSON() });
      },
    },
    [wikiId]
  );

  useEffect(() => {
    miniEditor?.setEditable(canEdit);
  }, [miniEditor, canEdit]);

  function handleMouseEnter() {
    if (open || !triggerRef.current) return;
    setTooltipPos(computeTooltipPosition(triggerRef.current));
    setHovering(true);
  }

  return (
    <NodeViewWrapper as="span" className="relative inline" contentEditable={false}>
      <sup>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setHovering(false);
            setOpen(true);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setHovering(false)}
          title={canEdit ? t("footnote.editHint") : undefined}
          className={`px-0.5 text-link ${canEdit ? "hover:underline" : "hover:opacity-70"}`}
        >
          [{index}]
        </button>
      </sup>

      {hovering && !open && (
        <span
          role="tooltip"
          style={{ position: "fixed", left: tooltipPos.left, top: tooltipPos.top, width: TOOLTIP_WIDTH }}
          className="z-20 whitespace-normal rounded-md border border-neutral-200 bg-white p-2 text-xs normal-case text-neutral-700 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
        >
          {plainText || t("doc.noFootnoteContent")}
        </span>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-divider bg-white shadow-xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && (
              <div className="flex items-center gap-1 border-b border-divider px-2 py-1.5">
                <MiniToolbarButton
                  title={t("editor.bold")}
                  active={!!miniEditor?.isActive("bold")}
                  onClick={() => miniEditor?.chain().focus().toggleBold().run()}
                >
                  <BoldIcon className="h-3.5 w-3.5" />
                </MiniToolbarButton>
                <MiniToolbarButton
                  title={t("editor.italic")}
                  active={!!miniEditor?.isActive("italic")}
                  onClick={() => miniEditor?.chain().focus().toggleItalic().run()}
                >
                  <ItalicIcon className="h-3.5 w-3.5" />
                </MiniToolbarButton>
                <MiniToolbarButton
                  title={t("editor.docLinkInsert")}
                  onClick={() => miniEditor?.chain().focus().insertContent("[[").run()}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </MiniToolbarButton>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-auto text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {t("common.confirm")}
                </button>
              </div>
            )}
            <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
              {miniEditor && <EditorContent editor={miniEditor} />}
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function MiniToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center rounded px-1.5 py-1 text-sm ${
        active ? "bg-brand/25 dark:bg-brand/30" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}
