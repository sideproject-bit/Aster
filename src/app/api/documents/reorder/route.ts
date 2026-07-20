import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditAccess } from "@/lib/wikiAccess";

type Update = { id: string; parentId: string | null; order: number };

async function wouldCreateCycle(movedId: string, newParentId: string | null): Promise<boolean> {
  let currentId = newParentId;
  while (currentId) {
    if (currentId === movedId) return true;
    const parent = await prisma.document.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    currentId = parent?.parentId ?? null;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const wikiId = typeof body.wikiId === "string" ? body.wikiId : "";
  if (!wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await requireEditAccess(wikiId);
  if ("error" in access) return access.error;

  const updates: Update[] = Array.isArray(body.updates) ? body.updates : [];
  if (updates.length === 0) {
    return NextResponse.json({ error: "updates is required" }, { status: 400 });
  }

  const ids = updates.map((u) => u.id);
  const ownedCount = await prisma.document.count({ where: { id: { in: ids }, wikiId } });
  if (ownedCount !== ids.length) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  for (const update of updates) {
    if (update.parentId === update.id) {
      return NextResponse.json(
        { error: "a document cannot be its own parent" },
        { status: 400 }
      );
    }
    if (update.parentId && (await wouldCreateCycle(update.id, update.parentId))) {
      return NextResponse.json(
        { error: "cannot move a folder/document inside its own descendant" },
        { status: 400 }
      );
    }
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.document.update({
        where: { id: u.id },
        data: { parentId: u.parentId, order: u.order },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
