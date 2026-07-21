import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { FootnoteView } from "./FootnoteView";

// The marker itself stays atomic (arrow keys/clicks skip over it like a single
// character) — its rich body lives in `content` (a full Tiptap document, edited
// via its own nested editor instance in FootnoteView) rather than a plain string,
// so it can hold bold/italic/wiki-links.
export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      content: { default: null as JSONContent | null },
      // Deprecated: footnotes used to store plain text here before they
      // supported rich content. Kept (rather than dropped from the schema)
      // so older documents' footnote text isn't discarded on load —
      // FootnoteView/collectFootnotes fall back to it when `content` is empty.
      text: { default: null as string | null },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes, { "data-footnote": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteView);
  },
});
