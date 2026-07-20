import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditAccess } from "@/lib/wikiAccess";

// Used by the WikiLink [[ autocomplete to find matching documents by title.
// Only editors (owner or collaborator) can edit, so this is edit-access-only like
// other write-adjacent routes.
export async function GET(req: NextRequest) {
  const wikiId = req.nextUrl.searchParams.get("wikiId");
  if (!wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await requireEditAccess(wikiId);
  if ("error" in access) return access.error;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const documents = await prisma.document.findMany({
    where: {
      wikiId,
      isFolder: false,
      ...(q ? { title: { contains: q } } : {}),
    },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
    take: 10,
  });

  return NextResponse.json(documents);
}
