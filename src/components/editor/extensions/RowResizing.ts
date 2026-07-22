import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

// prosemirror-tables only ships column resizing — this adds the vertical
// equivalent: dragging near a row's bottom edge sets an explicit height on
// that `tableRow` (see CustomTableRow.ts for the attribute itself).
const HANDLE_ZONE_PX = 5;
const MIN_ROW_HEIGHT_PX = 24;

type RowHit = { rowPos: number; rowDom: HTMLElement };

function findRow(view: EditorView, target: EventTarget | null): RowHit | null {
  if (!(target instanceof HTMLElement)) return null;
  const rowDom = target.closest("tr");
  if (!rowDom) return null;
  let pos: number;
  try {
    pos = view.posAtDOM(rowDom, 0);
  } catch {
    return null;
  }
  const $pos = view.state.doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth--) {
    if ($pos.node(depth).type.name === "tableRow") {
      return { rowPos: $pos.before(depth), rowDom };
    }
  }
  return null;
}

function hitTestBottomEdge(view: EditorView, event: MouseEvent): RowHit | null {
  const hit = findRow(view, event.target);
  if (!hit) return null;
  const rect = hit.rowDom.getBoundingClientRect();
  return Math.abs(event.clientY - rect.bottom) <= HANDLE_ZONE_PX ? hit : null;
}

export const RowResizing = Extension.create({
  name: "rowResizing",

  addProseMirrorPlugins() {
    const editor = this.editor;
    let dragging: { rowPos: number; startY: number; startHeight: number } | null = null;

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              if (dragging || !editor.isEditable) return false;
              const hit = hitTestBottomEdge(view, event);
              view.dom.classList.toggle("row-resize-cursor", !!hit);
              return false;
            },
            mouseleave(view) {
              if (!dragging) view.dom.classList.remove("row-resize-cursor");
              return false;
            },
            mousedown(view, event) {
              if (!editor.isEditable) return false;
              const hit = hitTestBottomEdge(view, event);
              if (!hit) return false;
              event.preventDefault();
              dragging = {
                rowPos: hit.rowPos,
                startY: event.clientY,
                startHeight: hit.rowDom.getBoundingClientRect().height,
              };
              const onMove = (moveEvent: MouseEvent) => {
                if (!dragging) return;
                const nextHeight = Math.max(
                  MIN_ROW_HEIGHT_PX,
                  Math.round(dragging.startHeight + (moveEvent.clientY - dragging.startY))
                );
                const node = view.state.doc.nodeAt(dragging.rowPos);
                if (!node) return;
                view.dispatch(
                  view.state.tr.setNodeMarkup(dragging.rowPos, undefined, {
                    ...node.attrs,
                    height: nextHeight,
                  })
                );
              };
              const onUp = () => {
                dragging = null;
                view.dom.classList.remove("row-resize-cursor");
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
              return true;
            },
          },
        },
      }),
    ];
  },
});
