import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function isCollaborator(wikiId: string, userId: string): Promise<boolean> {
  const link = await prisma.wikiCollaborator.findUnique({
    where: { wikiId_userId: { wikiId, userId } },
  });
  return !!link;
}

/**
 * Use in wiki-management routes only (rename/delete/public-toggle, collaborator
 * list management). These are owner-exclusive — collaborators do not get them.
 * Returns `{ error }` (403/404 NextResponse) when the caller isn't the wiki's owner —
 * callers should `if ("error" in access) return access.error;`.
 */
export async function requireOwnedWiki(wikiId: string) {
  const session = await auth();
  const wiki = await prisma.wiki.findUnique({ where: { id: wikiId } });

  if (!wiki) {
    return { error: NextResponse.json({ error: "not found" }, { status: 404 }) } as const;
  }
  if (!session?.user?.id || wiki.ownerId !== session.user.id) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) } as const;
  }
  return { wiki, userId: session.user.id } as const;
}

/**
 * Use in content-mutating routes (create/update/delete documents, tags, uploads,
 * reorder). A collaborator has the same content rights as the owner here.
 */
export async function requireEditAccess(wikiId: string) {
  const session = await auth();
  const wiki = await prisma.wiki.findUnique({ where: { id: wikiId } });

  if (!wiki) {
    return { error: NextResponse.json({ error: "not found" }, { status: 404 }) } as const;
  }
  const userId = session?.user?.id;
  const canEdit = !!userId && (wiki.ownerId === userId || (await isCollaborator(wikiId, userId)));
  if (!canEdit) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) } as const;
  }
  return { wiki, userId: userId as string } as const;
}

/**
 * Use in read routes (list/view documents, tags, graph). A wiki is viewable by its
 * owner or collaborators always, or by anyone (including anonymous visitors) when
 * `wiki.isPublic`. `isOwner` in the returned object means "has full content edit
 * rights" (owner OR collaborator) — despite the name, it also covers collaborators,
 * since within a wiki's document tree there's no UI distinction between the two.
 * Callers should further filter individual documents to
 * `status === "PUBLISHED" && isPublic` when `isOwner` is false.
 */
export async function getViewableWiki(wikiId: string) {
  const session = await auth();
  const wiki = await prisma.wiki.findUnique({ where: { id: wikiId } });
  if (!wiki) return null;

  const userId = session?.user?.id;
  const isOwner =
    !!userId && (wiki.ownerId === userId || (await isCollaborator(wikiId, userId)));
  if (isOwner || wiki.isPublic) return { wiki, isOwner };
  return null;
}
