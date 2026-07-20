"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useRef, useState, type RefObject } from "react";
import { WikiLink } from "./extensions/WikiLink";
import { Footnote } from "./extensions/Footnote";
import { EditorShortcuts } from "./extensions/EditorShortcuts";
import { CollapsibleHeading } from "./extensions/CollapsibleHeading";
import { CustomTableCell, CustomTableHeader } from "./extensions/CustomTableCell";
import { PromptModal } from "@/components/ui/PromptModal";
import { ColorSwatches } from "./ColorSwatches";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { ContextMenu, type ContextMenuItem } from "@/components/ui/ContextMenu";
import { TAG_COLORS } from "@/lib/tagColors";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  QuoteIcon,
  TextColorIcon,
  HighlightIcon,
  FootnoteIcon,
  ImageIcon,
  TableIcon,
  SwatchIcon,
  AddRowIcon,
  AddColumnIcon,
  DeleteRowIcon,
  DeleteColumnIcon,
  DeleteTableIcon,
  LinkIcon,
} from "./icons";

type Props = {
  wikiId: string;
  content: JSONContent;
  onChange: (json: JSONContent) => void;
  onSave?: () => void;
  editable?: boolean;
  containerRef?: RefObject<HTMLDivElement | null>;
};

async function uploadImage(wikiId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("wikiId", wikiId);
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("upload failed");
  const data = await res.json();
  return data.url as string;
}

export function Editor({
  wikiId,
  content,
  onChange,
  onSave,
  editable = true,
  containerRef,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addingFootnote, setAddingFootnote] = useState(false);
  const [editorMenu, setEditorMenu] = useState<{ x: number; y: number } | null>(null);
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({ heading: false }),
      CollapsibleHeading,
      Placeholder.configure({
        placeholder: "내용을 입력하세요… ## 제목, **굵게**, [[ 로 문서 링크, 이미지는 붙여넣기/드래그",
      }),
      Image,
      WikiLink.configure({ wikiId }),
      Footnote,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
      EditorShortcuts,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[50vh]",
      },
      handleDrop(view, event) {
        if (!editable) return false;
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith("image/")) return false;
        event.preventDefault();
        uploadImage(wikiId, file).then((url) => {
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          view.dispatch(
            view.state.tr.insert(
              pos ?? view.state.selection.from,
              view.state.schema.nodes.image.create({ src: url })
            )
          );
        });
        return true;
      },
      handlePaste(view, event) {
        if (!editable) return false;
        const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/")
        );
        if (!file) return false;
        event.preventDefault();
        uploadImage(wikiId, file).then((url) => {
          view.dispatch(
            view.state.tr.insert(
              view.state.selection.from,
              view.state.schema.nodes.image.create({ src: url })
            )
          );
        });
        return true;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  // Keep the editor content in sync when switching between documents.
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(content);
    if (current !== next) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Ctrl/Cmd+S force-saves immediately, bypassing the page's autosave debounce.
  useEffect(() => {
    if (!editor) return;
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveRef.current?.();
      }
    }
    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);
    return () => dom.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  if (!editor) return null;

  async function handleImageButton() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const url = await uploadImage(wikiId, file);
    editor.chain().focus().setImage({ src: url }).run();
  }

  function insertFootnote(text: string) {
    setAddingFootnote(false);
    if (!editor) return;
    editor.chain().focus().insertContent({ type: "footnote", attrs: { text } }).run();
  }

  function handleEditorContextMenu(e: React.MouseEvent) {
    if (!editable) return;
    e.preventDefault();
    setEditorMenu({ x: e.clientX, y: e.clientY });
  }

  function colorSwatchRow(onPick: (color: string) => void) {
    return (
      <div className="flex flex-wrap gap-1 px-3 py-1.5">
        {TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              onPick(color);
              setEditorMenu(null);
            }}
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }

  const editorMenuItems: ContextMenuItem[] = [
    {
      label: "굵게",
      icon: <BoldIcon className="h-3.5 w-3.5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "기울임",
      icon: <ItalicIcon className="h-3.5 w-3.5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    { separator: true },
    { custom: <div className="px-3 pb-0.5 pt-1 text-xs text-neutral-400">글자 색</div> },
    { custom: colorSwatchRow((color) => editor.chain().focus().setColor(color).run()) },
    { custom: <div className="px-3 pb-0.5 pt-1 text-xs text-neutral-400">배경 강조 색</div> },
    {
      custom: colorSwatchRow((color) =>
        editor.chain().focus().toggleHighlight({ color }).run()
      ),
    },
    { separator: true },
    {
      label: "각주 추가",
      icon: <FootnoteIcon className="h-3.5 w-3.5" />,
      onClick: () => setAddingFootnote(true),
    },
    {
      label: "문서 링크 삽입",
      icon: <LinkIcon className="h-3.5 w-3.5" />,
      onClick: () => editor.chain().focus().insertContent("[[").run(),
    },
  ];

  const inTable = editor.isActive("table");

  return (
    <div ref={containerRef}>
      {editable && (
      <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-2 dark:border-neutral-800">
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          title="제목 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          title="제목 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 4 })}
          title="제목 4"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        >
          H4
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 5 })}
          title="제목 5"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        >
          H5
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bold")}
          title="굵게"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          title="기울임"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          title="글머리 목록"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          title="인용"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon className="h-4 w-4" />
        </ToolbarButton>
        <ColorSwatches
          label={<TextColorIcon className="h-4 w-4" />}
          title="글자 색"
          onPick={(color) =>
            color
              ? editor.chain().focus().setColor(color).run()
              : editor.chain().focus().unsetColor().run()
          }
        />
        <ColorSwatches
          label={<HighlightIcon className="h-4 w-4" />}
          title="배경 강조 색"
          onPick={(color) =>
            color
              ? editor.chain().focus().toggleHighlight({ color }).run()
              : editor.chain().focus().unsetHighlight().run()
          }
        />
        <ToolbarButton title="각주 추가" onClick={() => setAddingFootnote(true)}>
          <FootnoteIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="이미지" onClick={handleImageButton}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="표 삽입"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        {inTable && (
          <>
            <ToolbarButton title="행 추가" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <AddRowIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="열 추가"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <AddColumnIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="행 삭제" onClick={() => editor.chain().focus().deleteRow().run()}>
              <DeleteRowIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="열 삭제"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <DeleteColumnIcon className="h-4 w-4" />
            </ToolbarButton>
            <ColorSwatches
              label={<SwatchIcon className="h-4 w-4" />}
              title="셀 배경 색"
              onPick={(color) =>
                editor.chain().focus().setCellAttribute("backgroundColor", color).run()
              }
            />
            <ToolbarButton
              title="표 삭제"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <DeleteTableIcon className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <span className="ml-auto flex items-center gap-2">
          <span
            className="text-xs text-neutral-400"
            title="예: [[등장인물 목록|여기"
          >
            [[ 또는 Ctrl/⌘+K 로 문서 링크
          </span>
          <ShortcutsHelp />
        </span>
      </div>
      )}
      <div onContextMenu={handleEditorContextMenu}>
        <EditorContent editor={editor} />
      </div>
      {editorMenu && (
        <ContextMenu
          x={editorMenu.x}
          y={editorMenu.y}
          items={editorMenuItems}
          onClose={() => setEditorMenu(null)}
        />
      )}
      {addingFootnote && (
        <PromptModal
          title="각주 내용"
          multiline
          onSubmit={insertFootnote}
          onCancel={() => setAddingFootnote(false)}
        />
      )}
    </div>
  );
}

function ToolbarButton({
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
      className={`flex items-center justify-center rounded px-2 py-1.5 text-sm ${
        active
          ? "bg-brand/25 dark:bg-brand/30"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}
