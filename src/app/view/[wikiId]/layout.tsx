import { getViewableWiki } from "@/lib/wikiAccess";
import { DocumentsProvider } from "@/context/DocumentsContext";
import { ViewSidebar } from "@/components/view/ViewSidebar";
import { NoAccessMessage } from "@/components/NoAccessMessage";

export default async function ViewWikiLayout({
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
    <DocumentsProvider wikiId={wikiId} isOwner={false} mode="view">
      <aside className="w-64 shrink-0 border-r border-card-border">
        <ViewSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </DocumentsProvider>
  );
}
