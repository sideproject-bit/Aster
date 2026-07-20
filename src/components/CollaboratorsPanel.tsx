"use client";

import { useEffect, useState } from "react";

type Collaborator = {
  userId: string;
  user: { email: string; name: string | null };
};

export function CollaboratorsPanel({ wikiId }: { wikiId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch(`/api/wikis/${wikiId}/collaborators`)
      .then((res) => res.json())
      .then(setCollaborators);
  }

  useEffect(refresh, [wikiId]);

  async function addCollaborator(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/wikis/${wikiId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "추가에 실패했습니다");
      return;
    }
    setEmail("");
    refresh();
  }

  async function removeCollaborator(userId: string) {
    await fetch(`/api/wikis/${wikiId}/collaborators/${userId}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="mt-2 rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
      <h3 className="mb-2 font-medium">공동 작성자</h3>

      {collaborators === null && <p className="text-neutral-400">불러오는 중…</p>}
      {collaborators?.length === 0 && (
        <p className="text-neutral-400">아직 공동 작성자가 없습니다.</p>
      )}
      {collaborators && collaborators.length > 0 && (
        <ul className="mb-3 space-y-1">
          {collaborators.map((c) => (
            <li key={c.userId} className="flex items-center justify-between">
              <span>{c.user.name ? `${c.user.name} (${c.user.email})` : c.user.email}</span>
              <button
                onClick={() => removeCollaborator(c.userId)}
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addCollaborator} className="flex gap-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일로 추가 (가입된 계정만 가능)"
          className="min-w-0 flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700"
        />
        <button
          type="submit"
          className="rounded bg-brand px-2 py-1 text-xs font-medium text-brand-foreground hover:opacity-90"
        >
          추가
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
