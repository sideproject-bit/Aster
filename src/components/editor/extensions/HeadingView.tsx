"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export function HeadingView({ node, editor, getPos }: NodeViewProps) {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const level: number = node.attrs.level ?? 2;
  const Tag = TAGS[level - 1] ?? "h2";

  function toggle() {
    const pos = getPos();
    if (typeof pos !== "number") return;
    const thisNode = editor.state.doc.nodeAt(pos);
    if (!thisNode) return;

    const nextCollapsed = !collapsed;
    const docSize = editor.state.doc.content.size;
    let cursor = pos + thisNode.nodeSize;

    // Walk forward through top-level siblings (via the document model, not DOM tag
    // names — every node view's outer DOM element is a plain <div> regardless of
    // the tag rendered inside it) until the next heading of equal-or-shallower level.
    while (cursor < docSize) {
      const node = editor.state.doc.nodeAt(cursor);
      if (!node) break;
      if (node.type.name === "heading" && (node.attrs.level as number) <= level) break;
      const dom = editor.view.nodeDOM(cursor);
      if (dom instanceof HTMLElement) {
        dom.style.display = nextCollapsed ? "none" : "";
      }
      cursor += node.nodeSize;
    }
    setCollapsed(nextCollapsed);
  }

  return (
    <NodeViewWrapper as={Tag} className="group flex items-baseline gap-1.5">
      <button
        type="button"
        contentEditable={false}
        onClick={toggle}
        title={collapsed ? t("heading.expand") : t("heading.collapse")}
        className="select-none text-xs text-neutral-300 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-300"
        style={{ userSelect: "none" }}
      >
        {collapsed ? "▶" : "▼"}
      </button>
      <NodeViewContent<"span"> as="span" className="flex-1" />
    </NodeViewWrapper>
  );
}
