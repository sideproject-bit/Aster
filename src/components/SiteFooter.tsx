"use client";

import { useLanguage } from "@/context/LanguageContext";

// Shown on marketing/dashboard-style pages (landing, login/signup, the
// wikis dashboard, account settings, the /view bookmarks landing) — not on
// the split-pane editor/viewer routes, which are height-constrained to
// exactly the viewport and have no room for a trailing footer.
export function SiteFooter({ pinBottom = false }: { pinBottom?: boolean }) {
  const { t } = useLanguage();
  return (
    <footer
      className={`${pinBottom ? "mt-auto" : "mt-16"} border-t border-divider px-8 py-6 text-center text-xs text-neutral-400`}
    >
      {t("site.copyright", { year: new Date().getFullYear() })}
    </footer>
  );
}
