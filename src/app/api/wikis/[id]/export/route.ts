import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getViewableWiki } from "@/lib/wikiAccess";
import { documentToMarkdown } from "@/lib/exportMarkdown";

type Params = { params: Promise<{ id: string }> };

type DocRow = {
  id: string;
  title: string;
  parentId: string | null;
  order: number;
  isFolder: boolean;
  content: unknown;
};

// Bundles every document in a wiki into one Markdown file, in tree order, so
// the whole wiki can be fed into an external AI as reference material (e.g. a
// game's worldbuilding notes) without hand-copying each page.
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: wikiId } = await params;
  const access = await getViewableWiki(wikiId);
  if (!access) return NextResponse.json({ error: "not found" }, { status: 404 });

  const documents = (await prisma.document.findMany({
    where: {
      wikiId,
      ...(access.isOwner ? {} : { OR: [{ isFolder: true }, { status: "PUBLISHED" }] }),
    },
    select: { id: true, title: true, parentId: true, order: true, isFolder: true, content: true },
    orderBy: [{ parentId: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  })) as DocRow[];

  const titleById = new Map(documents.map((d) => [d.id, d.title]));
  const byParent = new Map<string | null, DocRow[]>();
  for (const doc of documents) {
    const siblings = byParent.get(doc.parentId) ?? [];
    siblings.push(doc);
    byParent.set(doc.parentId, siblings);
  }
  for (const siblings of byParent.values()) siblings.sort((a, b) => a.order - b.order);

  const sections: string[] = [];
  function walk(parentId: string | null, path: string[]) {
    for (const doc of byParent.get(parentId) ?? []) {
      const body = documentToMarkdown(doc.content, titleById);
      const breadcrumb = [...path, doc.title].join(" / ");
      sections.push(
        [`# ${doc.title}`, `_${breadcrumb}${doc.isFolder ? " — folder" : ""}_`, body]
          .filter(Boolean)
          .join("\n\n")
      );
      walk(doc.id, [...path, doc.title]);
    }
  }
  walk(null, []);

  const markdown = `# ${access.wiki.title}\n\n${sections.join("\n\n---\n\n")}\n`;
  const rawFilename = `${access.wiki.title.trim() || "wiki"}.md`;
  // Non-ASCII titles (e.g. Korean) need the `filename*` form since a plain
  // quoted `filename=` can't safely carry non-ASCII bytes — browsers that
  // understand `filename*` (all current ones) prefer it and use the real
  // title; older ones fall back to this ASCII-only approximation.
  const asciiFallback = rawFilename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(rawFilename)}`,
    },
  });
}
