import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { getViewableWiki, requireEditAccess } from "@/lib/wikiAccess";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { tags: true },
  });
  if (!document) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const access = await getViewableWiki(document.wikiId);
  if (!access) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!access.isOwner && document.status !== "PUBLISHED") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ...document, isOwner: access.isOwner });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const access = await requireEditAccess(existing.wikiId);
  if ("error" in access) return access.error;
  const wikiId = existing.wikiId;

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.content !== "undefined") data.content = body.content;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.order === "number") data.order = body.order;
  if (Array.isArray(body.tagIds)) {
    data.tags = { set: body.tagIds.map((tagId: string) => ({ id: tagId })) };
  }
  if (typeof body.parentId !== "undefined") {
    if (body.parentId === id) {
      return NextResponse.json(
        { error: "a document cannot be its own parent" },
        { status: 400 }
      );
    }
    data.parentId = body.parentId;
  }

  if (typeof body.title === "string" && body.title.trim() && body.title !== existing.title) {
    const title = body.title.trim();
    data.title = title;
    data.slug = await uniqueSlug(title, async (candidate) => {
      if (candidate === existing.slug) return false;
      const clash = await prisma.document.findUnique({
        where: { wikiId_slug: { wikiId, slug: candidate } },
      });
      return !!clash;
    });
  }

  const document = await prisma.document.update({
    where: { id },
    data,
    include: { tags: true },
  });
  return NextResponse.json(document);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const access = await requireEditAccess(existing.wikiId);
  if ("error" in access) return access.error;

  // Reparent children up to the deleted document's parent, keeping the tree connected.
  await prisma.document.updateMany({
    where: { parentId: id },
    data: { parentId: existing.parentId },
  });
  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
