import { notFound } from "next/navigation";
import { getViewableWiki } from "@/lib/wikiAccess";
import { ViewWikiHome } from "@/components/view/ViewWikiHome";

export default async function ViewWikiHomePage({
  params,
}: {
  params: Promise<{ wikiId: string }>;
}) {
  const { wikiId } = await params;
  const access = await getViewableWiki(wikiId);
  if (!access) notFound();

  return <ViewWikiHome wikiTitle={access.wiki.title} />;
}
