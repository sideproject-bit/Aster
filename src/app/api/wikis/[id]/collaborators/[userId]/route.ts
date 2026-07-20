import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; userId: string }> };

// The owner can remove any collaborator; a collaborator can remove themselves (leave).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, userId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const wiki = await prisma.wiki.findUnique({ where: { id } });
  if (!wiki) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isOwner = wiki.ownerId === session.user.id;
  const isSelf = userId === session.user.id;
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.wikiCollaborator.deleteMany({ where: { wikiId: id, userId } });
  return NextResponse.json({ ok: true });
}
