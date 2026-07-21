import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ documentId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { documentId } = await params;

  await prisma.bookmark.deleteMany({
    where: { userId: session.user.id, documentId },
  });

  return NextResponse.json({ ok: true });
}
