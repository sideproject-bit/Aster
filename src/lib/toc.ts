type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
};

export type HeadingEntry = { level: number; text: string };

function extractText(node?: JSONNode): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(extractText).join("");
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
