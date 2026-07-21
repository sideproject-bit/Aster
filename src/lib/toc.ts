type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
};

export type HeadingEntry = { level: number; text: string };

// Inline (as opposed to block) node types — their results get concatenated
// directly with no separator, since text nodes already carry their own
// spacing. Anything else (paragraphs, list items, ...) gets a joining space
// so sibling blocks don't run together.
const INLINE_TYPES = new Set(["text", "wikiLink", "hardBreak"]);

function extractText(node?: JSONNode): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  // Wikilinks are atom nodes (no `content`) whose visible text lives in
  // `label` — without this they silently contribute nothing to the heading
  // text used for the table of contents / in-editor numbering.
  if (node.type === "wikiLink") {
    return (node.attrs?.label as string) ?? (node.attrs?.title as string) ?? "";
  }
  if (node.type === "hardBreak") return " ";
  const children = node.content ?? [];
  const joiner = children.every((c) => INLINE_TYPES.has(c.type)) ? "" : " ";
  return children.map(extractText).join(joiner);
}

export function collectHeadings(doc: JSONNode | null | undefined): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  function walk(node?: JSONNode) {
    if (!node) return;
    if (node.type === "heading") {
      const level = (node.attrs?.level as number) ?? 1;
      const text = extractText(node).trim();
      if (text) headings.push({ level, text });
    }
    node.content?.forEach(walk);
  }
  walk(doc ?? undefined);
  return headings;
}

// Namuwiki-style hierarchical numbering ("1", "1.1", "1.2", "2", ...) for a
// document-order list of heading levels. Shared by the table of contents and
// the in-editor heading numbers so the two never drift apart.
export function numberHeadings(levels: number[]): string[] {
  if (levels.length === 0) return [];
  const minLevel = Math.min(...levels);
  const counters: number[] = [];
  return levels.map((level) => {
    const depth = level - minLevel;
    counters.length = depth + 1;
    counters[depth] = (counters[depth] ?? 0) + 1;
    return counters.slice(0, depth + 1).join(".");
  });
}
