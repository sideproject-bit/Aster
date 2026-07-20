"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "가입에 실패했습니다");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/wikis");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-8 py-16">
      <h1 className="text-2xl font-semibold">회원가입</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="이름 (선택)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
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
          minLength={8}
          placeholder="비밀번호 (8자 이상)"
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
          {loading ? "가입 중…" : "회원가입"}
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          로그인
        </Link>
      </p>
    </div>
  );
}
