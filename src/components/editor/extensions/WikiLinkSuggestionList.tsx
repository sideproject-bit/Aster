"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useLanguage } from "@/context/LanguageContext";

export type WikiLinkSuggestionItem = {
  id: string | null;
  /** Title of the target document — used to find/create it. */
  title: string;
  /** Text shown in the document; differs from `title` for piped links ([[문서|표시]]). */
  label: string;
};

type Props = {
  items: WikiLinkSuggestionItem[];
  command: (item: WikiLinkSuggestionItem) => void;
};

export type WikiLinkSuggestionListHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export const WikiLinkSuggestionList = forwardRef<WikiLinkSuggestionListHandle, Props>(
  function WikiLinkSuggestionList({ items, command }, ref) {
    const { t } = useLanguage();
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === "ArrowDown") {
          setSelected((v) => (v + 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelected((v) => (v - 1 + items.length) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selected];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-400 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {t("wikiLinkSuggest.noMatch")}
        </div>
      );
    }

    return (
      <div className="max-h-64 w-64 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
        {items.map((item, i) => (
          <button
            key={item.id ?? item.title}
            type="button"
            className={`flex w-full flex-col items-start px-3 py-1.5 text-left ${
              i === selected
                ? "bg-neutral-100 dark:bg-neutral-800"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            }`}
            onMouseEnter={() => setSelected(i)}
            onClick={() => command(item)}
          >
            <span className="w-full truncate">
              {item.id ? item.title : t("wikiLinkSuggest.createNew", { title: item.title })}
            </span>
            {item.label !== item.title && (
              <span className="w-full truncate text-xs text-neutral-400">
                {t("wikiLinkSuggest.displayAs", { label: item.label })}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }
);
