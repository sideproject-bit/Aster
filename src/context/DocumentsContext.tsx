"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Status = "DRAFT" | "PUBLISHED";

export type TagSummary = {
  id: string;
  name: string;
  color: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  status: Status;
  order: number;
  isFolder: boolean;
  tags: TagSummary[];
};

type DocumentsContextValue = {
  wikiId: string;
  isOwner: boolean;
  documents: DocumentSummary[];
  loading: boolean;
  refresh: () => Promise<void>;
  byId: (id: string) => DocumentSummary | undefined;
  childrenOf: (parentId: string | null) => DocumentSummary[];
  ancestors: (id: string) => DocumentSummary[];
  isDescendant: (candidateId: string, ancestorId: string) => boolean;
};

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({
  wikiId,
  isOwner,
  children,
}: {
  wikiId: string;
  isOwner: boolean;
  children: ReactNode;
}) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/documents?wikiId=${wikiId}`);
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  }, [wikiId]);

  useEffect(() => {
    fetch(`/api/documents?wikiId=${wikiId}`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      });
  }, [wikiId]);

  const byId = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents]
  );

  const childrenOf = useCallback(
    (parentId: string | null) =>
      documents
        .filter((d) => d.parentId === parentId)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [documents]
  );

  const ancestors = useCallback(
    (id: string) => {
      const chain: DocumentSummary[] = [];
      let current = documents.find((d) => d.id === id);
      while (current) {
        chain.unshift(current);
        current = current.parentId
          ? documents.find((d) => d.id === current!.parentId)
          : undefined;
      }
      return chain;
    },
    [documents]
  );

  // True if `candidateId` is `ancestorId` itself or one of its descendants —
  // used to block drag-and-drop moves that would create a cycle.
  const isDescendant = useCallback(
    (candidateId: string, ancestorId: string) => {
      if (candidateId === ancestorId) return true;
      let current = documents.find((d) => d.id === candidateId);
      while (current?.parentId) {
        if (current.parentId === ancestorId) return true;
        current = documents.find((d) => d.id === current!.parentId);
      }
      return false;
    },
    [documents]
  );

  return (
    <DocumentsContext.Provider
      value={{
        wikiId,
        isOwner,
        documents,
        loading,
        refresh,
        byId,
        childrenOf,
        ancestors,
        isDescendant,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
