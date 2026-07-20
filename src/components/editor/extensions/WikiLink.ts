import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { WikiLinkView } from "./WikiLinkView";
import {
  WikiLinkSuggestionList,
  type WikiLinkSuggestionListHandle,
  type WikiLinkSuggestionItem,
} from "./WikiLinkSuggestionList";

export interface WikiLinkOptions {
  wikiId: string;
  suggestion: Omit<SuggestionOptions<WikiLinkSuggestionItem>, "editor" | "items" | "command">;
}

// Namuwiki-style piped syntax: "[[검색어|표시할 텍스트" — the part before "|" is used to
// find/create the target document, the part after "|" (if any) overrides the display label.
function parseQuery(query: string): { searchTerm: string; customLabel?: string } {
  const pipeIndex = query.indexOf("|");
  if (pipeIndex === -1) return { searchTerm: query.trim() };
  return {
    searchTerm: query.slice(0, pipeIndex).trim(),
    customLabel: query.slice(pipeIndex + 1).trim(),
  };
}

async function searchDocuments(wikiId: string, query: string): Promise<WikiLinkSuggestionItem[]> {
  const { searchTerm, customLabel } = parseQuery(query);
  const res = await fetch(
    `/api/documents/search?wikiId=${wikiId}&q=${encodeURIComponent(searchTerm)}`
  );
  const docs: { id: string; title: string }[] = await res.json();
  const items: WikiLinkSuggestionItem[] = docs.map((d) => ({
    id: d.id,
    title: d.title,
    label: customLabel || d.title,
  }));
  const exactMatch = docs.some((d) => d.title === searchTerm);
  if (searchTerm && !exactMatch) {
    items.push({ id: null, title: searchTerm, label: customLabel || searchTerm });
  }
  return items;
}

export const WikiLink = Node.create<WikiLinkOptions>({
  name: "wikiLink",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      docId: { default: null },
      // Title of the target document (used to find/create it). Falls back to `label`
      // for content created before this attribute existed.
      title: { default: null },
      // Text actually shown in the document; may differ from `title` (piped link).
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-wiki-link]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-wiki-link": "",
        "data-doc-id": node.attrs.docId ?? "",
        "data-title": node.attrs.title ?? node.attrs.label,
      }),
      node.attrs.label,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WikiLinkView);
  },

  addOptions() {
    return {
      wikiId: "",
      suggestion: {
        char: "[[",
        pluginKey: undefined,
        allowSpaces: true,
        render: () => {
          let component: ReactRenderer<WikiLinkSuggestionListHandle>;
          let popup: TippyInstance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(WikiLinkSuggestionList, {
                props,
                editor: props.editor,
              });
              if (!props.clientRect) return;
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate(props) {
              component.updateProps(props);
              if (!props.clientRect) return;
              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },
            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }
              return component.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              popup[0]?.destroy();
              component.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: async ({ query }: { query: string }) => searchDocuments(this.options.wikiId, query),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: "wikiLink",
                attrs: { docId: props.id, title: props.title, label: props.label },
              },
              { type: "text", text: " " },
            ])
            .run();
        },
      }),
    ];
  },
});
