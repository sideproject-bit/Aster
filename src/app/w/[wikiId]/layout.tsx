import { getViewableWiki } from "@/lib/wikiAccess";
import { DocumentsProvider } from "@/context/DocumentsContext";
import { DocumentTree } from "@/components/sidebar/DocumentTree";
import { ResizableSidebar } from "@/components/sidebar/ResizableSidebar";
import { NoAccessMessage } from "@/components/NoAccessMessage";
import { ScrollRestoringMain } from "@/components/ScrollRestoringMain";

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
      <ResizableSidebar>
        <DocumentTree />
      </ResizableSidebar>
      <ScrollRestoringMain>{children}</ScrollRestoringMain>
    </DocumentsProvider>
  );
}
