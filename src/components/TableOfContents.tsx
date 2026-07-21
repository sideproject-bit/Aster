"use client";

import { useState, type RefObject } from "react";
import { numberHeadings, type HeadingEntry } from "@/lib/toc";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  headings: HeadingEntry[];
  containerRef: RefObject<HTMLDivElement | null>;
};

export function TableOfContents({ headings, containerRef }: Props) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  if (headings.length < 2) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));
  const numbers = numberHeadings(headings.map((h) => h.level));

  function scrollTo(index: number) {
    const el = containerRef.current?.querySelectorAll("h1, h2, h3, h4, h5, h6")[index];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mb-6 rounded-lg border border-divider">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium"
      >
        {t("toc.title")}
        <span className="text-xs font-normal text-neutral-400">
          {expanded ? t("toc.collapse") : t("toc.expand")}
        </span>
      </button>
      {expanded && (
        <ol className="space-y-1 px-4 pb-3 text-sm">
          {headings.map((h, i) => (
            <li key={i} style={{ paddingLeft: (h.level - minLevel) * 16 }}>
              <button
                type="button"
                onClick={() => scrollTo(i)}
                className="text-left text-link hover:underline"
              >
                {numbers[i]}. {h.text}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
