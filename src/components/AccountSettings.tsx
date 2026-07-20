"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PasswordConfirmModal } from "@/components/ui/PasswordConfirmModal";

const ERROR_KEYS: Record<string, string> = {
  incorrect_password: "account.error.incorrectPassword",
};

export function AccountSettings({ email, name }: { email: string; name: string | null }) {
  const { t } = useLanguage();
  const [confirmingStep1, setConfirmingStep1] = useState(false);
  const [confirmingPassword, setConfirmingPassword] = useState(false);

  async function handleFinalDelete(password: string) {
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: ERROR_KEYS[data.error] ? t(ERROR_KEYS[data.error]) : t("account.error.generic") };
    }
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{t("account.title")}</h1>
      <div className="mb-8">
        {name && <p className="font-medium">{name}</p>}
        <p className="text-sm text-neutral-500">{email}</p>
      </div>

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
            setConfirmingPassword(true);
          }}
          onCancel={() => setConfirmingStep1(false)}
        />
      )}

      {confirmingPassword && (
        <PasswordConfirmModal
          title={t("account.deleteAccount")}
          message={t("account.passwordPrompt")}
          confirmLabel={t("account.deleteButton")}
          loadingLabel={t("account.deleting")}
          onSubmit={handleFinalDelete}
          onCancel={() => setConfirmingPassword(false)}
        />
      )}
    </div>
  );
}
