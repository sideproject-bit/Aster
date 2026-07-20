import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditAccess } from "@/lib/wikiAccess";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) return NextResponse.json({ error: "not found" }, { status: 404 });

  const access = await requireEditAccess(tag.wikiId);
  if ("error" in access) return access.error;

  await prisma.tag.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
