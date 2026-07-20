"use client";

import { useParams } from "next/navigation";
import { useDocuments } from "@/context/DocumentsContext";
import Link from "next/link";

export default function WikiHome() {
  const { wikiId } = useParams<{ wikiId: string }>();
  const { documents, loading, isOwner } = useDocuments();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-2">내 위키</h1>
      <p className="text-neutral-500 max-w-md mb-6">
        {isOwner
          ? "왼쪽 사이드바의 + 버튼으로 새 문서를 만들거나, 아래 목록에서 문서를 선택하세요."
          : "아래 목록에서 문서를 선택하세요."}
      </p>
      {!loading && documents.length > 0 && (
        <ul className="text-left w-full max-w-sm space-y-1">
          {documents
            .filter((d) => !d.parentId && !d.isFolder)
            .map((d) => (
              <li key={d.id}>
                <Link
                  href={`/w/${wikiId}/wiki/${d.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {d.title}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
