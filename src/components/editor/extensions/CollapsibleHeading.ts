import Heading from "@tiptap/extension-heading";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { HeadingView } from "./HeadingView";

export const collapsibleHeadingPluginKey = new PluginKey("collapsibleHeading");

type PluginState = {
  collapsedPositions: number[];
  decorations: DecorationSet;
};

function buildDecorations(doc: ProseMirrorNode, collapsedPositions: number[]): DecorationSet {
  const decorations: Decoration[] = [];
  for (const pos of collapsedPositions) {
    const node = doc.nodeAt(pos);
    if (!node || node.type.name !== "heading") continue;
    const level = node.attrs.level as number;
    const docSize = doc.content.size;
    let cursor = pos + node.nodeSize;
    while (cursor < docSize) {
      const sibling = doc.nodeAt(cursor);
      if (!sibling) break;
      if (sibling.type.name === "heading" && (sibling.attrs.level as number) <= level) break;
      decorations.push(Decoration.node(cursor, cursor + sibling.nodeSize, { style: "display: none" }));
      cursor += sibling.nodeSize;
    }
  }
  return DecorationSet.create(doc, decorations);
}

// Adds a fold/unfold toggle to each heading (Namuwiki-style section collapsing).
// Levels are restricted to 2-5: H1 is reserved for the document title elsewhere,
// and capping at H5 keeps the auto-generated table of contents numbering sane.
//
// Which sections are collapsed lives in a ProseMirror plugin (not a React
// effect manually poking `style.display` on sibling DOM nodes) because
// ProseMirror re-syncs the DOM on every transaction and would silently undo a
// manual mutation. The plugin rebuilds its decorations from the current
// document on every transaction, so content typed into an already-collapsed
// section stays hidden too, instead of only whatever existed when it was
// folded.
export const CollapsibleHeading = Heading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(HeadingView);
  },
  addProseMirrorPlugins() {
    return [
      new Plugin<PluginState>({
        key: collapsibleHeadingPluginKey,
        state: {
          init(_config, state) {
            return { collapsedPositions: [], decorations: DecorationSet.create(state.doc, []) };
          },
          apply(tr, value) {
            let collapsedPositions = value.collapsedPositions.map((pos) => tr.mapping.map(pos));
            const toggle = tr.getMeta(collapsibleHeadingPluginKey) as
              | { pos: number; collapsed: boolean }
              | undefined;
            if (toggle) {
              collapsedPositions = toggle.collapsed
                ? [...collapsedPositions, toggle.pos]
                : collapsedPositions.filter((pos) => pos !== toggle.pos);
            }
            return { collapsedPositions, decorations: buildDecorations(tr.doc, collapsedPositions) };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations;
          },
        },
      }),
    ];
  },
}).configure({ levels: [2, 3, 4, 5] });
