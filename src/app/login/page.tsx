"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
      return;
    }
    router.push("/wikis");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-8 py-16">
      <h1 className="text-2xl font-semibold">로그인</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
        <input
          type="password"
          required
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand px-3 py-2 font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
          회원가입
        </Link>
      </p>
    </div>
  );
}
