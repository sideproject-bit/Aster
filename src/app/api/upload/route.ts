import { NextRequest, NextResponse } from "next/server";
import { requireEditAccess } from "@/lib/wikiAccess";
import { storeUploadedFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const wikiId = formData.get("wikiId");
  if (typeof wikiId !== "string" || !wikiId) {
    return NextResponse.json({ error: "wikiId is required" }, { status: 400 });
  }
  const access = await requireEditAccess(wikiId);
  if ("error" in access) return access.error;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "only image uploads are supported" }, { status: 400 });
  }

  const url = await storeUploadedFile(wikiId, file);
  return NextResponse.json({ url });
}
