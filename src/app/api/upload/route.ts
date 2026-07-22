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

  try {
    const url = await storeUploadedFile(wikiId, file);
    return NextResponse.json({ url });
  } catch (err) {
    // Without BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID, storeUploadedFile falls
    // back to writing to local disk — which throws on Vercel, since the
    // filesystem there is read-only outside /tmp. That used to surface as a
    // bare 500 with no body, indistinguishable from any other server error.
    console.error("Image upload failed:", err);
    const message =
      !process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID
        ? "image storage is not configured for this deployment (no Blob store connected)"
        : "could not store the uploaded file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
