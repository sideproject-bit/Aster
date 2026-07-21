import { getViewableWiki } from "@/lib/wikiAccess";
import { DocumentsProvider } from "@/context/DocumentsContext";
import { DocumentTree } from "@/components/sidebar/DocumentTree";
import { NoAccessMessage } from "@/components/NoAccessMessage";

export default async function WikiLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ wikiId: string }>;
}) {
  const { wikiId } = await params;
  const access = await getViewableWiki(wikiId);

  if (!access) {
    return <NoAccessMessage />;
  }

  return (
    <DocumentsProvider wikiId={wikiId} isOwner={access.isOwner}>
      <aside className="w-64 shrink-0 border-r border-divider">
        <DocumentTree />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </DocumentsProvider>
  );
}
