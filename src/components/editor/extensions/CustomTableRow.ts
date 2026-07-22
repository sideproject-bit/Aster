import TableRow from "@tiptap/extension-table-row";

// Adds an explicit row height, set by dragging the handle near a row's bottom
// edge (see RowResizing.ts) — prosemirror-tables only ships column resizing
// out of the box.
export const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null as number | null,
        parseHTML: (element: HTMLElement) => {
          const height = parseInt(element.style.height || "", 10);
          return Number.isFinite(height) ? height : null;
        },
        renderHTML: (attributes: { height?: number | null }) => {
          if (!attributes.height) return {};
          return { style: `height: ${attributes.height}px` };
        },
      },
    };
  },
});
