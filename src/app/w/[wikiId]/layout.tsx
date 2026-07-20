import { getViewableWiki } from "@/lib/wikiAccess";
import { DocumentsProvider } from "@/context/DocumentsContext";
import { DocumentTree } from "@/components/sidebar/DocumentTree";

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
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="mb-2 text-lg font-medium">접근할 수 없습니다</p>
          <p className="text-sm text-neutral-500">비공개 위키이거나 존재하지 않는 위키입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <DocumentsProvider wikiId={wikiId} isOwner={access.isOwner}>
      <aside className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800">
        <DocumentTree />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </DocumentsProvider>
  );
}
