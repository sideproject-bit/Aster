"use client";

import { useEffect, useRef, useState } from "react";
import { TAG_COLORS } from "@/lib/tagColors";
import type { TagSummary } from "@/context/DocumentsContext";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  wikiId: string;
  tags: TagSummary[];
  onChange: (tags: TagSummary[]) => void;
};

export function TagPicker({ wikiId, tags, onChange }: Props) {
  const { t } = useLanguage();
  const [allTags, setAllTags] = useState<TagSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(TAG_COLORS[0]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/tags?wikiId=${wikiId}`)
      .then((res) => res.json())
      .then(setAllTags);
  }, [wikiId]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleTag(tag: TagSummary) {
    const isAssigned = tags.some((t) => t.id === tag.id);
    onChange(isAssigned ? tags.filter((t) => t.id !== tag.id) : [...tags, tag]);
  }

  async function createTag() {
    const name = newName.trim();
    if (!name) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wikiId, name, color: newColor }),
    });
    const created: TagSummary = await res.json();
    setAllTags((prev) =>
      prev.some((t) => t.id === created.id) ? prev : [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    onChange([...tags, created]);
    setNewName("");
  }

  return (
    <div className="relative inline-flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
          <button
            type="button"
            onClick={() => toggleTag(tag)}
            className="leading-none opacity-80 hover:opacity-100"
            title={t("tagPicker.removeTag")}
          >
            ×
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:hover:text-neutral-300"
      >
        {t("tagPicker.addTag")}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border border-neutral-200 bg-white p-2 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {allTags.length > 0 && (
            <div className="mb-2 max-h-40 space-y-0.5 overflow-y-auto">
              {allTags.map((tag) => {
                const checked = tags.some((t) => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate">{tag.name}</span>
                    {checked && <span className="text-neutral-400">✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
            <div className="mb-1.5 flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`h-4 w-4 rounded-full ${
                    newColor === color ? "ring-2 ring-offset-1 ring-brand" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createTag()}
                placeholder={t("tagPicker.newTagName")}
                className="min-w-0 flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700"
              />
              <button
                type="button"
                onClick={createTag}
                className="rounded bg-brand px-2 py-1 text-xs font-medium text-brand-foreground hover:opacity-90"
              >
                {t("tagPicker.add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
