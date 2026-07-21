type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
};

// Inline (as opposed to block) node types — their results get concatenated
// directly with no separator, since text nodes already carry their own
// spacing. Anything else (paragraphs, list items, ...) gets a joining space
// so sibling blocks don't run together.
const INLINE_TYPES = new Set(["text", "wikiLink", "hardBreak"]);

function extractText(node?: JSONNode): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  // Wikilinks are atom nodes (no `content`) whose visible text lives in
  // `label` — without this they silently vanish from the plain-text summary
  // shown in the footnotes list, e.g. "see [[here]] for details" would
  // render as "see for details".
  if (node.type === "wikiLink") {
    return (node.attrs?.label as string) ?? (node.attrs?.title as string) ?? "";
  }
  if (node.type === "hardBreak") return " ";
  const children = node.content ?? [];
  const joiner = children.every((c) => INLINE_TYPES.has(c.type)) ? "" : " ";
  return children.map(extractText).join(joiner);
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
        notes.push(extractText(body).trim());
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
