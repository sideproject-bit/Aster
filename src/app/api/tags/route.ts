import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditAccess } from "@/lib/wikiAccess";

// Only used by the TagPicker's editing UI (assign/create tags), so edit-access-only —
// public viewers see a document's tags embedded in the document payload itself.
export async function GET(req: NextRequest) {
  const wikiId = req.nextUrl.searchParams.get("wikiId");
  if (!wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await requireEditAccess(wikiId);
  if ("error" in access) return access.error;

  const tags = await prisma.tag.findMany({
    where: { wikiId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const wikiId = typeof body.wikiId === "string" ? body.wikiId : "";
  if (!wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await requireEditAccess(wikiId);
  if ("error" in access) return access.error;

  const name: string = typeof body.name === "string" ? body.name.trim() : "";
  const color: string = typeof body.color === "string" ? body.color : "";
  if (!name || !color) {
    return NextResponse.json({ error: "name and color are required" }, { status: 400 });
  }

  const existing = await prisma.tag.findUnique({ where: { wikiId_name: { wikiId, name } } });
  if (existing) return NextResponse.json(existing);

  const tag = await prisma.tag.create({ data: { wikiId, name, color } });
  return NextResponse.json(tag, { status: 201 });
}
