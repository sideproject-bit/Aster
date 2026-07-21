type JSONMark = { type: string; attrs?: Record<string, unknown> };
type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
  marks?: JSONMark[];
};

function applyMarks(text: string, marks?: JSONMark[]): string {
  if (!text || !marks || marks.length === 0) return text;
  let out = text;
  for (const mark of marks) {
    if (mark.type === "bold") out = `**${out}**`;
    else if (mark.type === "italic") out = `*${out}*`;
    else if (mark.type === "highlight") out = `==${out}==`;
    // textStyle/color carry no meaningful plain-text representation — skipped.
  }
  return out;
}

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
}

// Converts a single document's Tiptap JSON into Markdown, resolving wikilinks
// to `[[Target Title]]` (so an AI reading the export can still see which
// documents reference each other) and collecting footnotes into numbered
// references + a definition list at the end, matching how they render in the app.
export function documentToMarkdown(
  content: unknown,
  docTitleById: Map<string, string>
): string {
  const footnotes: string[] = [];

  function inline(nodes?: JSONNode[]): string {
    return (nodes ?? []).map(inlineNode).join("");
  }

  function inlineNode(node: JSONNode): string {
    switch (node.type) {
      case "text":
        return applyMarks(node.text ?? "", node.marks);
      case "hardBreak":
        return "  \n";
      case "wikiLink": {
        const docId = node.attrs?.docId as string | null | undefined;
        const label =
          (node.attrs?.label as string) ?? (node.attrs?.title as string) ?? "";
        const resolvedTitle = docId ? docTitleById.get(docId) : undefined;
        return resolvedTitle ? `[[${resolvedTitle}]]` : label;
      }
      case "footnote": {
        const body = node.attrs?.content as JSONNode | null | undefined;
        const text = body
          ? blockChildren(body.content).join(" ").trim()
          : ((node.attrs?.text as string) ?? "");
        footnotes.push(text || "(empty)");
        return `[^${footnotes.length}]`;
      }
      case "image":
        return `![](${(node.attrs?.src as string) ?? ""})`;
      default:
        return inline(node.content);
    }
  }

  // Each list item becomes one block string (its own lines joined with "\n",
  // continuation lines indented past the marker) rather than separate flat
  // lines — otherwise the top-level "\n\n" join between blocks would insert
  // blank lines between every item and break the list.
  function listItems(items: JSONNode[] | undefined, ordered: boolean, depth: number): string[] {
    const indent = "  ".repeat(depth);
    return (items ?? []).map((item, index) => {
      const marker = ordered ? `${index + 1}.` : "-";
      const text = blockChildren(item.content, depth + 1).join("\n\n");
      const lines = text.split("\n");
      const continuationIndent = " ".repeat(marker.length + 1);
      return [
        `${indent}${marker} ${lines[0] ?? ""}`,
        ...lines.slice(1).map((l) => `${indent}${continuationIndent}${l}`),
      ].join("\n");
    });
  }

  // Returns one block string (rows joined with a single "\n") so the table
  // stays contiguous — GFM table syntax breaks if a blank line appears
  // between the header, separator, or any data row.
  function table(node: JSONNode): string {
    const rows = node.content ?? [];
    if (rows.length === 0) return "";
    const cellText = (cell: JSONNode) =>
      escapeTableCell(blockChildren(cell.content).join(" "));
    const rendered = rows.map((row) => (row.content ?? []).map(cellText));
    const colCount = Math.max(...rendered.map((r) => r.length));
    const pad = (r: string[]) => [...r, ...Array(colCount - r.length).fill("")];
    const [header, ...body] = rendered;
    return [
      `| ${pad(header).join(" | ")} |`,
      `| ${pad(header).map(() => "---").join(" | ")} |`,
      ...body.map((r) => `| ${pad(r).join(" | ")} |`),
    ].join("\n");
  }

  // Renders block-level (paragraph/heading/list/table/...) nodes into a list
  // of block strings — each entry may be multi-line internally (tables,
  // lists, blockquotes), but blocks themselves are joined with a blank line
  // by the caller. `depth` only affects list indentation.
  function blockChildren(nodes: JSONNode[] | undefined, depth = 0): string[] {
    const blocks: string[] = [];
    for (const node of nodes ?? []) {
      switch (node.type) {
        case "paragraph":
          blocks.push(inline(node.content));
          break;
        case "heading": {
          const level = Math.min(6, Math.max(1, (node.attrs?.level as number) ?? 2));
          blocks.push(`${"#".repeat(level)} ${inline(node.content)}`);
          break;
        }
        case "blockquote": {
          const inner = blockChildren(node.content, depth);
          blocks.push(
            inner.map((b) => b.split("\n").map((l) => `> ${l}`).join("\n")).join("\n>\n")
          );
          break;
        }
        case "bulletList":
          blocks.push(listItems(node.content, false, depth).join("\n"));
          break;
        case "orderedList":
          blocks.push(listItems(node.content, true, depth).join("\n"));
          break;
        case "table":
          blocks.push(table(node));
          break;
        case "horizontalRule":
          blocks.push("---");
          break;
        default:
          blocks.push(...blockChildren(node.content, depth));
      }
    }
    return blocks;
  }

  const doc = content as JSONNode | null | undefined;
  // Filters out empty paragraphs (ProseMirror always keeps a trailing empty
  // one for cursor placement) so they don't leave stray blank lines behind.
  const blocks = blockChildren(doc?.content).filter((b) => b.trim() !== "");
  footnotes.forEach((text, i) => blocks.push(`[^${i + 1}]: ${text}`));
  return blocks.join("\n\n");
}
