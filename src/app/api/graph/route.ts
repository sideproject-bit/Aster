import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectWikiLinkTargets } from "@/lib/wikiLinks";
import { getViewableWiki } from "@/lib/wikiAccess";

const DEFAULT_NODE_COLOR = "#a3a3a3";

export async function GET(req: NextRequest) {
  const wikiId = req.nextUrl.searchParams.get("wikiId");
  if (!wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await getViewableWiki(wikiId);
  if (!access) return NextResponse.json({ error: "not found" }, { status: 404 });

  const documents = await prisma.document.findMany({
    where: {
      wikiId,
      isFolder: false,
      ...(access.isOwner ? {} : { status: "PUBLISHED", isPublic: true }),
    },
    select: {
      id: true,
      title: true,
      parentId: true,
      content: true,
      tags: { select: { color: true } },
    },
  });

  const ids = new Set(documents.map((d) => d.id));

  const nodes = documents.map((d) => ({
    id: d.id,
    title: d.title,
    color: d.tags[0]?.color ?? DEFAULT_NODE_COLOR,
  }));

  const links: { source: string; target: string; type: "wikiLink" | "parent" }[] = [];

  for (const doc of documents) {
    if (doc.parentId && ids.has(doc.parentId)) {
      links.push({ source: doc.parentId, target: doc.id, type: "parent" });
    }
    const targets = collectWikiLinkTargets(
      doc.content as Parameters<typeof collectWikiLinkTargets>[0]
    );
    for (const targetId of targets) {
      if (ids.has(targetId) && targetId !== doc.id) {
        links.push({ source: doc.id, target: targetId, type: "wikiLink" });
      }
    }
  }

  return NextResponse.json({ nodes, links });
}
