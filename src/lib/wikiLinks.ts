type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
};

export function collectWikiLinkTargets(doc: JSONNode | null | undefined): string[] {
  const targets: string[] = [];
  function walk(node?: JSONNode) {
    if (!node) return;
    if (node.type === "wikiLink" && typeof node.attrs?.docId === "string") {
      targets.push(node.attrs.docId);
    }
    node.content?.forEach(walk);
  }
  walk(doc ?? undefined);
  return targets;
}
