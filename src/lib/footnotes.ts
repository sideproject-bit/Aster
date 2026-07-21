type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
};

function extractText(node?: JSONNode): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(extractText).join(" ").trim();
}

// Footnote bodies are themselves a small rich-text document (see
// extensions/Footnote.ts) — this walks that nested content to build the
// plain-text summary shown in the footnotes list at the bottom of the page.
export function collectFootnotes(doc: JSONNode | null | undefined): string[] {
  const notes: string[] = [];
  function walk(node?: JSONNode) {
    if (!node) return;
    if (node.type === "footnote") {
      const body = node.attrs?.content as JSONNode | null | undefined;
      if (body) {
        notes.push(extractText(body));
      } else {
        // Older documents stored plain text before footnotes supported rich content.
        notes.push((node.attrs?.text as string) ?? "");
      }
      return;
    }
    node.content?.forEach(walk);
  }
  walk(doc ?? undefined);
  return notes;
}
