import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedWiki } from "@/lib/wikiAccess";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireOwnedWiki(id);
  if ("error" in access) return access.error;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;
  if (typeof body.coverImageUrl === "string" || body.coverImageUrl === null) {
    data.coverImageUrl = body.coverImageUrl;
  }

  const wiki = await prisma.wiki.update({ where: { id }, data });
  return NextResponse.json(wiki);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireOwnedWiki(id);
  if ("error" in access) return access.error;

  await prisma.wiki.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
