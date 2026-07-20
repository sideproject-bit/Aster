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
