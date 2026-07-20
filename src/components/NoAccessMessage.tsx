"use client";

import { useLanguage } from "@/context/LanguageContext";

export function NoAccessMessage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <div>
        <p className="mb-2 text-lg font-medium">{t("wikiLayout.noAccessTitle")}</p>
        <p className="text-sm text-neutral-500">{t("wikiLayout.noAccessBody")}</p>
      </div>
    </div>
  );
}
