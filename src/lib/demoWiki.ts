import type { JSONContent } from "@tiptap/react";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { translate, type Lang } from "@/lib/i18n";

function heading(level: number, text: string): JSONContent {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}

function paragraph(content: JSONContent[]): JSONContent {
  return { type: "paragraph", content };
}

function text(value: string, marks?: { type: string }[]): JSONContent {
  return marks ? { type: "text", text: value, marks } : { type: "text", text: value };
}

function wikiLink(docId: string, title: string): JSONContent {
  return { type: "wikiLink", attrs: { docId, title, label: title } };
}

function footnote(noteText: string): JSONContent {
  return { type: "footnote", attrs: { text: noteText } };
}

function tableCell(kind: "tableHeader" | "tableCell", value: string): JSONContent {
  return { type: kind, content: [paragraph([text(value)])] };
}

// Builds an example wiki (auto-created on signup) demonstrating wikilinks, footnotes,
// text formatting, and tables so new users have something to explore right away.
export async function createDemoWiki(ownerId: string, lang: Lang) {
  const t = (key: string) => translate(lang, key);

  const wiki = await prisma.wiki.create({
    data: { title: t("demoWiki.title"), ownerId },
  });

  const charListTitle = t("demoWiki.charListTitle");
  const charListDoc = await prisma.document.create({
    data: {
      wikiId: wiki.id,
      title: charListTitle,
      slug: slugify(charListTitle),
      status: "PUBLISHED",
      content: {
        type: "doc",
        content: [paragraph([text(t("demoWiki.charListBody"))])],
      } satisfies JSONContent,
    },
  });

  const welcomeTitle = t("demoWiki.welcomeTitle");
  const welcomeContent: JSONContent = {
    type: "doc",
    content: [
      paragraph([text(t("demoWiki.welcomeBody"))]),

      heading(2, t("demoWiki.linkingTitle")),
      paragraph([text(t("demoWiki.linkingBody1") + " "), wikiLink(charListDoc.id, charListTitle)]),
      paragraph([text(t("demoWiki.linkingBody2"))]),

      heading(2, t("demoWiki.formattingTitle")),
      paragraph([text(t("demoWiki.formattingBody"))]),
      {
        type: "bulletList",
        content: [
          { type: "listItem", content: [paragraph([text(t("demoWiki.formattingBullet1"))])] },
          { type: "listItem", content: [paragraph([text(t("demoWiki.formattingBullet2"))])] },
          { type: "listItem", content: [paragraph([text(t("demoWiki.formattingBullet3"))])] },
        ],
      },
      paragraph([
        text(t("demoWiki.example") + " "),
        text(t("editor.bold"), [{ type: "bold" }]),
        text(" / "),
        text(t("editor.italic"), [{ type: "italic" }]),
        text(" "),
        footnote(t("demoWiki.footnoteExample")),
      ]),
      { type: "blockquote", content: [paragraph([text(t("demoWiki.formattingQuote"))])] },

      heading(2, t("demoWiki.tableTitle")),
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              tableCell("tableHeader", t("demoWiki.tableHeaderA")),
              tableCell("tableHeader", t("demoWiki.tableHeaderB")),
            ],
          },
          {
            type: "tableRow",
            content: [
              tableCell("tableCell", t("demoWiki.tableRow1A")),
              tableCell("tableCell", t("demoWiki.tableRow1B")),
            ],
          },
          {
            type: "tableRow",
            content: [
              tableCell("tableCell", t("demoWiki.tableRow2A")),
              tableCell("tableCell", t("demoWiki.tableRow2B")),
            ],
          },
        ],
      },
    ],
  };

  await prisma.document.create({
    data: {
      wikiId: wiki.id,
      title: welcomeTitle,
      slug: slugify(welcomeTitle),
      status: "PUBLISHED",
      content: welcomeContent,
    },
  });

  return wiki;
}
