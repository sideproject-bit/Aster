import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// List wikis the signed-in user owns or collaborates on.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const select = {
    id: true,
    title: true,
    isPublic: true,
    createdAt: true,
    _count: { select: { documents: true } },
  } as const;

  const [owned, collaborating] = await Promise.all([
    prisma.wiki.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "asc" }, select }),
    prisma.wiki.findMany({
      where: { collaborators: { some: { userId } } },
      orderBy: { createdAt: "asc" },
      select,
    }),
  ]);

  return NextResponse.json([
    ...owned.map((w) => ({ ...w, role: "owner" as const })),
    ...collaborating.map((w) => ({ ...w, role: "editor" as const })),
  ]);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const wiki = await prisma.wiki.create({
    data: { title, ownerId: session.user.id },
  });

  return NextResponse.json(wiki, { status: 201 });
}
