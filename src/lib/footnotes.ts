type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
};

export function collectFootnotes(doc: JSONNode | null | undefined): string[] {
  const notes: string[] = [];
  function walk(node?: JSONNode) {
    if (!node) return;
    if (node.type === "footnote") {
      notes.push((node.attrs?.text as string) ?? "");
    }
    node.content?.forEach(walk);
  }
  walk(doc ?? undefined);
  return notes;
}
