"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDocuments, DocumentSummary } from "@/context/DocumentsContext";
import { PromptModal } from "@/components/ui/PromptModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ContextMenu, type ContextMenuItem } from "@/components/ui/ContextMenu";
import { FolderIcon, DocIcon, PencilIcon } from "./icons";
import { useLanguage } from "@/context/LanguageContext";

type DropPosition = "before" | "after" | "inside";
type DropTarget = { id: string; position: DropPosition };

type DragHandlers = {
  draggedId: string | null;
  dropTarget: DropTarget | null;
  onDragStart: (id: string) => void;
  onDragOverNode: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
};

function buildReorderUpdates(
  documents: DocumentSummary[],
  movedId: string,
  targetId: string,
  position: DropPosition
): { id: string; parentId: string | null; order: number }[] {
  const byId = (id: string) => documents.find((d) => d.id === id)!;
  const moved = byId(movedId);
  const target = byId(targetId);
  const newParentId = position === "inside" ? targetId : target.parentId;

  const siblings = documents
    .filter((d) => d.parentId === newParentId && d.id !== movedId)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  let insertIndex: number;
  if (position === "inside") {
    insertIndex = siblings.length;
  } else {
    const targetIndex = siblings.findIndex((s) => s.id === targetId);
    insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
  }

  const reordered = [...siblings];
  reordered.splice(insertIndex, 0, moved);

  return reordered.map((doc, index) => ({ id: doc.id, parentId: newParentId, order: index }));
}

function TreeNode({
  doc,
  depth,
  wikiId,
  isOwner,
  renamingId,
  onRequestRename,
  onRequestNew,
  onRequestContextMenu,
  drag,
}: {
  doc: DocumentSummary;
  depth: number;
  wikiId: string;
  isOwner: boolean;
  renamingId: string | null;
  onRequestRename: (id: string | null) => void;
  onRequestNew: (parentId: string | null, isFolder: boolean) => void;
  onRequestContextMenu: (doc: DocumentSummary, x: number, y: number) => void;
  drag: DragHandlers;
}) {
  const { childrenOf, refresh, docPath } = useDocuments();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams<{ docId?: string }>();
  const kids = childrenOf(doc.id);
  const [expanded, setExpanded] = useState(true);
  const editing = renamingId === doc.id;
  const [titleDraft, setTitleDraft] = useState(doc.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = params.docId === doc.id;
  const isDragged = drag.draggedId === doc.id;
  const dropHere = drag.dropTarget?.id === doc.id ? drag.dropTarget.position : null;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function saveRename() {
    const title = titleDraft.trim();
    onRequestRename(null);
    if (!title || title === doc.title) return;
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    await refresh();
  }

  return (
    <div>
      <div
        draggable={isOwner && !editing}
        onDragStart={(e) => {
          e.stopPropagation();
          drag.onDragStart(doc.id);
        }}
        onDragOver={(e) => isOwner && drag.onDragOverNode(e, doc.id)}
        onDrop={(e) => isOwner && drag.onDrop(e, doc.id)}
        onDragEnd={drag.onDragEnd}
        onContextMenu={(e) => {
          if (!isOwner) return;
          e.preventDefault();
          e.stopPropagation();
          onRequestContextMenu(doc, e.clientX, e.clientY);
        }}
        className={`group relative flex items-center gap-1 rounded px-2 py-1 text-sm cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          isActive ? "bg-brand/20 font-medium dark:bg-brand/25" : ""
        } ${isDragged ? "opacity-40" : ""} ${
          dropHere === "inside" ? "bg-brand/20" : ""
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() =>
          doc.isFolder ? setExpanded((v) => !v) : router.push(docPath(doc.id))
        }
      >
        {dropHere === "before" && (
          <span className="absolute left-0 right-0 top-0 h-0.5 bg-brand" />
        )}
        {dropHere === "after" && (
          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-brand" />
        )}
        {kids.length > 0 ? (
          <button
            className="w-4 shrink-0 text-neutral-400"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {doc.isFolder ? (
          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        ) : (
          <DocIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        )}
        {doc.tags.length > 0 && (
          <span className="flex shrink-0 -space-x-0.5">
            {doc.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                title={tag.name}
                className="h-2 w-2 rounded-full ring-1 ring-white dark:ring-neutral-900"
                style={{ backgroundColor: tag.color }}
              />
            ))}
          </span>
        )}
        {editing ? (
          <input
            ref={inputRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) (e.currentTarget as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setTitleDraft(doc.title);
                onRequestRename(null);
              }
            }}
            className="min-w-0 flex-1 rounded border border-neutral-300 bg-white px-1 py-0 text-sm outline-none focus:border-neutral-500 dark:border-neutral-600 dark:bg-neutral-900"
          />
        ) : (
          <span className={`truncate flex-1 ${doc.isFolder ? "font-medium" : ""}`}>
            {doc.title}
          </span>
        )}
        {!doc.isFolder && doc.status === "DRAFT" && (
          <span className="text-[10px] text-amber-600 shrink-0">{t("sidebar.draft")}</span>
        )}
        {isOwner && !editing && (
          <>
            <button
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 shrink-0"
              title={t("sidebar.rename")}
              onClick={(e) => {
                e.stopPropagation();
                onRequestRename(doc.id);
              }}
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            <button
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 shrink-0"
              title={t("sidebar.addSubdoc")}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
                onRequestNew(doc.id, false);
              }}
            >
              +
            </button>
          </>
        )}
      </div>
      {expanded &&
        kids.map((child) => (
          <TreeNode
            key={child.id}
            doc={child}
            depth={depth + 1}
            wikiId={wikiId}
            isOwner={isOwner}
            renamingId={renamingId}
            onRequestRename={onRequestRename}
            onRequestNew={onRequestNew}
            onRequestContextMenu={onRequestContextMenu}
            drag={drag}
          />
        ))}
    </div>
  );
}

export function DocumentTree() {
  const { wikiId, isOwner, documents, childrenOf, loading, refresh, isDescendant, byId, docPath } =
    useDocuments();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams<{ docId?: string }>();
  const roots = childrenOf(null);
  const currentDoc = params.docId ? byId(params.docId) : undefined;
  const [creatingUnder, setCreatingUnder] = useState<string | null | undefined>(undefined);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ doc: DocumentSummary; x: number; y: number } | null>(null);
  const [deleting, setDeleting] = useState<DocumentSummary | null>(null);

  async function createDocument(title: string) {
    const parentId = creatingUnder ?? null;
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wikiId, title, parentId, isFolder: creatingFolder }),
    });
    const created = await res.json();

    // Slot the new document in right after whichever document is currently
    // open, instead of leaving it appended at the end, when they share a parent.
    if (!creatingFolder && currentDoc && currentDoc.parentId === parentId) {
      const updates = buildReorderUpdates([...documents, created], created.id, currentDoc.id, "after");
      await fetch("/api/documents/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wikiId, updates }),
      });
    }

    await refresh();
    setCreatingUnder(undefined);
    setCreatingFolder(false);
    if (!creatingFolder) router.push(docPath(created.id));
  }

  function requestNew(parentId: string | null, isFolder: boolean) {
    setCreatingFolder(isFolder);
    setCreatingUnder(parentId);
  }

  async function deleteDocument() {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    await refresh();
    if (params.docId === id) router.push(`/w/${wikiId}`);
  }

  function onDragOverNode(e: React.DragEvent, targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    if (isDescendant(targetId, draggedId)) return; // can't drop into your own subtree
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    const position: DropPosition = ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "inside";
    setDropTarget({ id: targetId, position });
  }

  async function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (draggedId && dropTarget && dropTarget.id === targetId) {
      const updates = buildReorderUpdates(documents, draggedId, targetId, dropTarget.position);
      setDraggedId(null);
      setDropTarget(null);
      await fetch("/api/documents/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wikiId, updates }),
      });
      await refresh();
    } else {
      setDraggedId(null);
      setDropTarget(null);
    }
  }

  const drag: DragHandlers = {
    draggedId,
    dropTarget,
    onDragStart: setDraggedId,
    onDragOverNode,
    onDrop,
    onDragEnd: () => {
      setDraggedId(null);
      setDropTarget(null);
    },
  };

  const menuItems: ContextMenuItem[] = menu
    ? [
        { label: t("sidebar.contextRename"), onClick: () => setRenamingId(menu.doc.id) },
        { label: t("sidebar.contextNewSubdoc"), onClick: () => requestNew(menu.doc.id, false) },
        { label: t("sidebar.contextNewSubfolder"), onClick: () => requestNew(menu.doc.id, true) },
        { separator: true },
        { label: t("sidebar.contextDelete"), danger: true, onClick: () => setDeleting(menu.doc) },
      ]
    : [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {t("sidebar.documents")}
        </span>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              title={t("sidebar.newFolder")}
              onClick={() => requestNew(null, true)}
            >
              <FolderIcon className="h-4 w-4" />
            </button>
            <button
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-lg leading-none"
              title={t("sidebar.newDocument")}
              onClick={() => requestNew(currentDoc?.parentId ?? null, false)}
            >
              +
            </button>
          </div>
        )}
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto py-2"
        onDragOver={(e) => isOwner && e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          if (!isOwner || !draggedId) return;
          // Dropped on empty space below the tree: move to root level, at the end.
          const rootSiblings = documents
            .filter((d) => d.parentId === null && d.id !== draggedId)
            .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
          const moved = documents.find((d) => d.id === draggedId);
          if (!moved) return;
          const updates = [...rootSiblings, moved].map((doc, index) => ({
            id: doc.id,
            parentId: null,
            order: index,
          }));
          setDraggedId(null);
          setDropTarget(null);
          await fetch("/api/documents/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wikiId, updates }),
          });
          await refresh();
        }}
      >
        {loading && <div className="px-3 text-sm text-neutral-400">{t("common.loading")}</div>}
        {!loading && roots.length === 0 && (
          <div className="px-3 text-sm text-neutral-400">
            {isOwner ? t("sidebar.noDocumentsOwner") : t("sidebar.noDocumentsViewer")}
          </div>
        )}
        {roots.map((doc) => (
          <TreeNode
            key={doc.id}
            doc={doc}
            depth={0}
            wikiId={wikiId}
            isOwner={isOwner}
            renamingId={renamingId}
            onRequestRename={setRenamingId}
            onRequestNew={requestNew}
            onRequestContextMenu={(doc, x, y) => setMenu({ doc, x, y })}
            drag={drag}
          />
        ))}
      </div>
      <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <button
          onClick={() => router.push(`/w/${wikiId}/graph`)}
          className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {t("sidebar.viewGraph")}
        </button>
      </div>
      {creatingUnder !== undefined && (
        <PromptModal
          title={
            creatingFolder
              ? creatingUnder
                ? t("sidebar.newSubfolderPrompt")
                : t("sidebar.newFolderPrompt")
              : creatingUnder
                ? t("sidebar.newSubdocPrompt")
                : t("sidebar.newDocPrompt")
          }
          onSubmit={createDocument}
          onCancel={() => {
            setCreatingUnder(undefined);
            setCreatingFolder(false);
          }}
        />
      )}
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
      {deleting && (
        <ConfirmModal
          message={t(deleting.isFolder ? "sidebar.deleteFolderConfirm" : "sidebar.deleteDocConfirm", {
            title: deleting.title,
          })}
          onConfirm={deleteDocument}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
