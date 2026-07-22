import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Uses Vercel Blob when configured (production/serverless — the filesystem there is
// read-only/ephemeral), otherwise falls back to local disk (local dev, and any future
// self-hosted/desktop build where a plain filesystem is available and preferable).
//
// A project connected to a Blob store no longer necessarily gets a
// BLOB_READ_WRITE_TOKEN — Vercel's newer OIDC-based auth instead provisions
// BLOB_STORE_ID and expects `put()` to resolve a short-lived token itself via
// the automatically-injected VERCEL_OIDC_TOKEN, with no token env var at all.
// Checking only for BLOB_READ_WRITE_TOKEN meant a store connected this way
// was silently ignored, falling through to the disk path (which then throws
// on Vercel's read-only filesystem).
export async function storeUploadedFile(wikiId: string, file: File): Promise<string> {
  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${wikiId}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", wikiId);
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${wikiId}/${filename}`;
}
