"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TypeToConfirmModal } from "@/components/ui/TypeToConfirmModal";

export function AccountSettings({ email }: { email: string }) {
  const { t } = useLanguage();
  const [confirmingStep1, setConfirmingStep1] = useState(false);
  const [confirmingStep2, setConfirmingStep2] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleFinalDelete() {
    setDeleting(true);
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{t("account.title")}</h1>
      <p className="mb-8 text-sm text-neutral-500">{email}</p>

      <div className="rounded-lg border border-red-300 p-4 dark:border-red-900">
        <h2 className="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">
          {t("account.dangerZoneTitle")}
        </h2>
        <p className="mb-3 text-sm text-neutral-500">{t("account.deleteWarning")}</p>
        <button
          onClick={() => setConfirmingStep1(true)}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500"
        >
          {t("account.deleteAccount")}
        </button>
      </div>

      {confirmingStep1 && (
        <ConfirmModal
          message={t("account.deleteConfirmStep1")}
          confirmLabel={t("account.continue")}
          onConfirm={() => {
            setConfirmingStep1(false);
            setConfirmingStep2(true);
          }}
          onCancel={() => setConfirmingStep1(false)}
        />
      )}

      {confirmingStep2 && (
        <TypeToConfirmModal
          title={t("account.deleteAccount")}
          message={t("account.typeEmailPrompt", { email })}
          confirmText={email}
          confirmLabel={deleting ? t("account.deleting") : t("account.deleteButton")}
          onConfirm={handleFinalDelete}
          onCancel={() => setConfirmingStep2(false)}
        />
      )}
    </div>
  );
}
