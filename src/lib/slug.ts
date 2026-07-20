export function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "untitled";
}

export async function uniqueSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let i = 1;
  while (await isTaken(candidate)) {
    candidate = `${base}-${++i}`;
  }
  return candidate;
}
