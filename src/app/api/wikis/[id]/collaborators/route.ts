import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedWiki, requireEditAccess } from "@/lib/wikiAccess";

type Params = { params: Promise<{ id: string }> };

// Anyone with edit access (owner or collaborator) can see who else has access.
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireEditAccess(id);
  if ("error" in access) return access.error;

  const collaborators = await prisma.wikiCollaborator.findMany({
    where: { wikiId: id },
    select: { userId: true, createdAt: true, user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(collaborators);
}

// Add a collaborator by email — owner only, and the email must already have an account.
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireOwnedWiki(id);
  if ("error" in access) return access.error;

  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "가입된 계정이 없는 이메일입니다" }, { status: 404 });
  }
  if (user.id === access.wiki.ownerId) {
    return NextResponse.json({ error: "이미 이 위키의 소유자입니다" }, { status: 400 });
  }

  const collaborator = await prisma.wikiCollaborator.upsert({
    where: { wikiId_userId: { wikiId: id, userId: user.id } },
    update: {},
    create: { wikiId: id, userId: user.id },
    select: { userId: true, createdAt: true, user: { select: { email: true, name: true } } },
  });

  return NextResponse.json(collaborator, { status: 201 });
}
