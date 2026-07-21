import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { EMPTY_DOC } from "@/lib/emptyDoc";
import { getViewableWiki, requireEditAccess } from "@/lib/wikiAccess";

// List documents in a wiki (lightweight fields, used for tree + breadcrumb).
// Non-owners (only reachable when the wiki itself is public) only see published
// documents (folders are always visible for navigation structure).
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
      ...(access.isOwner ? {} : { OR: [{ isFolder: true }, { status: "PUBLISHED" }] }),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
      status: true,
      order: true,
      isFolder: true,
      tags: { select: { id: true, name: true, color: true } },
    },
    orderBy: [{ parentId: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(documents);
}

// Create a new document. Used both by "new document" UI and by clicking a
// red (not-yet-created) wikilink, which creates a doc titled after the link label.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const wikiId = typeof body.wikiId === "string" ? body.wikiId : "";
  if (!wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await requireEditAccess(wikiId);
  if ("error" in access) return access.error;

  const title: string = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const parentId: string | null = body.parentId ?? null;
  const isFolder: boolean = body.isFolder === true;

  const slug = await uniqueSlug(title, async (candidate) => {
    const existing = await prisma.document.findUnique({
      where: { wikiId_slug: { wikiId, slug: candidate } },
    });
    return !!existing;
  });

  const document = await prisma.document.create({
    data: {
      wikiId,
      parentId,
      title,
      slug,
      isFolder,
      content: body.content ?? EMPTY_DOC,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
