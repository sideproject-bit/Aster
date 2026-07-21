import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getViewableWiki } from "@/lib/wikiAccess";

// List the signed-in user's bookmarks, most recent first.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      document: {
        select: {
          id: true,
          title: true,
          status: true,
          wiki: { select: { id: true, title: true, isPublic: true } },
        },
      },
    },
  });

  return NextResponse.json(bookmarks);
}

// Bookmark a document found via a public wiki's shared link.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const documentId = typeof body.documentId === "string" ? body.documentId : "";
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const access = await getViewableWiki(document.wikiId);
  if (!access || (!access.isOwner && document.status !== "PUBLISHED")) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_documentId: { userId: session.user.id, documentId } },
    create: { userId: session.user.id, documentId },
    update: {},
  });

  return NextResponse.json(bookmark, { status: 201 });
}
