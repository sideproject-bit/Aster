"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PromptModal } from "@/components/ui/PromptModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CollaboratorsPanel } from "@/components/CollaboratorsPanel";

type Wiki = {
  id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  role: "owner" | "editor";
  _count: { documents: number };
};

export function WikisDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [wikis, setWikis] = useState<Wiki[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Wiki | null>(null);
  const [deleting, setDeleting] = useState<Wiki | null>(null);
  const [leaving, setLeaving] = useState<Wiki | null>(null);
  const [managingCollaborators, setManagingCollaborators] = useState<string | null>(null);

  function refresh() {
    fetch("/api/wikis")
      .then((res) => res.json())
      .then(setWikis);
  }

  useEffect(refresh, []);

  async function createWiki(title: string) {
    const res = await fetch("/api/wikis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const created = await res.json();
    setCreating(false);
    router.push(`/w/${created.id}`);
  }

  async function renameWiki(title: string) {
    if (!renaming) return;
    await fetch(`/api/wikis/${renaming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setRenaming(null);
    refresh();
  }

  async function togglePublic(wiki: Wiki) {
    await fetch(`/api/wikis/${wiki.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !wiki.isPublic }),
    });
    refresh();
  }

  async function deleteWiki() {
    if (!deleting) return;
    await fetch(`/api/wikis/${deleting.id}`, { method: "DELETE" });
    setDeleting(null);
    refresh();
  }

  async function leaveWiki() {
    if (!leaving || !session?.user?.id) return;
    await fetch(`/api/wikis/${leaving.id}/collaborators/${session.user.id}`, {
      method: "DELETE",
    });
    setLeaving(null);
    refresh();
  }

  const owned = wikis?.filter((w) => w.role === "owner") ?? [];
  const collaborating = wikis?.filter((w) => w.role === "editor") ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">내 위키</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          새 위키
        </button>
      </div>

      {wikis === null && <p className="text-sm text-neutral-400">불러오는 중…</p>}
      {wikis?.length === 0 && (
        <p className="text-sm text-neutral-400">
          아직 위키가 없습니다. &quot;새 위키&quot; 버튼으로 시작하세요.
        </p>
      )}

      {owned.length > 0 && (
        <ul className="space-y-2">
          {owned.map((wiki) => (
            <li
              key={wiki.id}
              className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/w/${wiki.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {wiki.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                    <span>문서 {wiki._count.documents}개</span>
                    <span
                      className={
                        wiki.isPublic
                          ? "rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-500 dark:bg-neutral-800"
                      }
                    >
                      {wiki.isPublic ? "공개" : "비공개"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <button
                    onClick={() =>
                      setManagingCollaborators((v) => (v === wiki.id ? null : wiki.id))
                    }
                    className="hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    공동 작성자
                  </button>
                  <button
                    onClick={() => togglePublic(wiki)}
                    className="hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    {wiki.isPublic ? "비공개로" : "공개로"}
                  </button>
                  <button
                    onClick={() => setRenaming(wiki)}
                    className="hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    이름변경
                  </button>
                  <button onClick={() => setDeleting(wiki)} className="hover:text-red-500">
                    삭제
                  </button>
                </div>
              </div>
              {managingCollaborators === wiki.id && <CollaboratorsPanel wikiId={wiki.id} />}
            </li>
          ))}
        </ul>
      )}

      {collaborating.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">공동 작성 중인 위키</h2>
          <ul className="space-y-2">
            {collaborating.map((wiki) => (
              <li
                key={wiki.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
              >
                <div>
                  <Link
                    href={`/w/${wiki.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {wiki.title}
                  </Link>
                  <div className="mt-0.5 text-xs text-neutral-400">
                    문서 {wiki._count.documents}개
                  </div>
                </div>
                <button onClick={() => setLeaving(wiki)} className="text-sm text-neutral-500 hover:text-red-500">
                  나가기
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {creating && (
        <PromptModal title="새 위키 이름" onSubmit={createWiki} onCancel={() => setCreating(false)} />
      )}
      {renaming && (
        <PromptModal
          title="위키 이름 변경"
          initialValue={renaming.title}
          onSubmit={renameWiki}
          onCancel={() => setRenaming(null)}
        />
      )}
      {deleting && (
        <ConfirmModal
          message={`"${deleting.title}" 위키를 삭제할까요? 안의 모든 문서가 함께 삭제됩니다.`}
          onConfirm={deleteWiki}
          onCancel={() => setDeleting(null)}
        />
      )}
      {leaving && (
        <ConfirmModal
          message={`"${leaving.title}" 위키의 공동 작성자에서 나갈까요?`}
          confirmLabel="나가기"
          onConfirm={leaveWiki}
          onCancel={() => setLeaving(null)}
        />
      )}
    </div>
  );
}
