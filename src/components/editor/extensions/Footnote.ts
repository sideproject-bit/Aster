import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FootnoteView } from "./FootnoteView";

export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      text: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes, { "data-footnote": "" }), node.attrs.text];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteView);
  },
});
