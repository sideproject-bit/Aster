"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { numberHeadings } from "@/lib/toc";
import { collapsibleHeadingPluginKey } from "./CollapsibleHeading";

const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export function HeadingView({ node, editor, getPos }: NodeViewProps) {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [number, setNumber] = useState("");

  // Recomputes this heading's position number whenever the doc changes.
  // Section fold/unfold itself is handled by the collapsibleHeading
  // ProseMirror plugin's decorations, not here.
  useEffect(() => {
    function recompute() {
      const myPos = getPos();
      if (typeof myPos !== "number") return;

      const levels: number[] = [];
      const positions: number[] = [];
      editor.state.doc.descendants((n, pos) => {
        if (n.type.name === "heading") {
          levels.push(n.attrs.level as number);
          positions.push(pos);
        }
      });
      const myIndex = positions.indexOf(myPos);
      if (myIndex !== -1) {
        setNumber(numberHeadings(levels)[myIndex]);
      }
    }
    recompute();
    editor.on("update", recompute);
    return () => {
      editor.off("update", recompute);
    };
  }, [editor, getPos]);

  const level: number = node.attrs.level ?? 2;
  const Tag = TAGS[level - 1] ?? "h2";

  function toggle() {
    const pos = getPos();
    if (typeof pos !== "number") return;
    const nextCollapsed = !collapsed;
    editor.view.dispatch(editor.state.tr.setMeta(collapsibleHeadingPluginKey, { pos, collapsed: nextCollapsed }));
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
      {number && (
        <span
          contentEditable={false}
          className="select-none text-[0.7em] font-normal text-neutral-400 dark:text-neutral-500"
          style={{ userSelect: "none" }}
        >
          {number}
        </span>
      )}
      <NodeViewContent<"span"> as="span" className="flex-1" />
    </NodeViewWrapper>
  );
}
