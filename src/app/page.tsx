import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/wikis");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <h1 className="mb-2 text-3xl font-bold">Aster</h1>
      <p className="mb-6 max-w-md text-neutral-500">
        옵시디언과 나무위키를 결합한 나만의 세계관 위키를 만들어보세요.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded bg-brand px-4 py-2 font-medium text-brand-foreground hover:opacity-90"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
