"use client";

import { useLanguage } from "@/context/LanguageContext";

// Right-aligned notice below a document's footnotes/sub-documents sections
// (Namuwiki-style), reminding readers the document itself is still owned by
// whoever wrote it — distinct from the site-wide copyright in SiteFooter.
export function DocumentCopyrightNotice() {
  const { t } = useLanguage();
  return (
    <p className="mt-10 border-t border-divider pt-4 text-right text-xs text-neutral-400">
      {t("doc.copyrightNotice")}
    </p>
  );
}
