import type { JSONContent } from "@tiptap/react";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { translate, type Lang } from "@/lib/i18n";
import { EMPTY_DOC } from "@/lib/emptyDoc";

function heading(level: number, value: string): JSONContent {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text: value }] };
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

function bulletList(items: string[]): JSONContent {
  return {
    type: "bulletList",
    content: items.map((item) => ({ type: "listItem", content: [paragraph([text(item)])] })),
  };
}

function tableCell(kind: "tableHeader" | "tableCell", value: string): JSONContent {
  return { type: kind, content: [paragraph([text(value)])] };
}

function table(headers: string[], rows: string[][]): JSONContent {
  return {
    type: "table",
    content: [
      { type: "tableRow", content: headers.map((h) => tableCell("tableHeader", h)) },
      ...rows.map((row) => ({ type: "tableRow", content: row.map((c) => tableCell("tableCell", c)) })),
    ],
  };
}

function projectTemplateContent(lang: Lang): JSONContent {
  const t = (key: string) => translate(lang, key);
  return {
    type: "doc",
    content: [
      heading(2, t("demoWiki.tpl.project.goalHeading")),
      paragraph([text(t("demoWiki.tpl.project.goalBody"))]),
      heading(2, t("demoWiki.tpl.project.statusHeading")),
      table(
        [t("demoWiki.tpl.project.colTask"), t("demoWiki.tpl.project.colOwner"), t("demoWiki.tpl.project.colStatus")],
        [[t("demoWiki.tpl.project.exampleTask"), t("demoWiki.tpl.project.exampleOwner"), t("demoWiki.tpl.project.exampleStatus")]]
      ),
      heading(2, t("demoWiki.tpl.project.milestonesHeading")),
      bulletList([t("demoWiki.tpl.project.milestone1"), t("demoWiki.tpl.project.milestone2")]),
    ],
  };
}

function meetingTemplateContent(lang: Lang): JSONContent {
  const t = (key: string) => translate(lang, key);
  return {
    type: "doc",
    content: [
      heading(2, t("demoWiki.tpl.meeting.dateHeading")),
      paragraph([text(t("demoWiki.tpl.meeting.dateBody"))]),
      heading(2, t("demoWiki.tpl.meeting.agendaHeading")),
      bulletList([t("demoWiki.tpl.meeting.agenda1"), t("demoWiki.tpl.meeting.agenda2")]),
      heading(2, t("demoWiki.tpl.meeting.actionsHeading")),
      table(
        [t("demoWiki.tpl.meeting.colAction"), t("demoWiki.tpl.meeting.colOwner"), t("demoWiki.tpl.meeting.colDue")],
        [["", "", ""]]
      ),
    ],
  };
}

function studyTemplateContent(lang: Lang): JSONContent {
  const t = (key: string) => translate(lang, key);
  return {
    type: "doc",
    content: [
      heading(2, t("demoWiki.tpl.study.topicHeading")),
      paragraph([text(t("demoWiki.tpl.study.topicBody"))]),
      heading(2, t("demoWiki.tpl.study.summaryHeading")),
      paragraph([text(t("demoWiki.tpl.study.summaryBody"))]),
      heading(2, t("demoWiki.tpl.study.termsHeading")),
      bulletList([t("demoWiki.tpl.study.term1"), t("demoWiki.tpl.study.term2")]),
    ],
  };
}

// Body of a "Welcome to Aster" document (excluding the cross-language link paragraph,
// which is prepended separately once both language versions' ids are known).
function welcomeSections(lang: Lang): JSONContent[] {
  const t = (key: string) => translate(lang, key);
  return [
    paragraph([text(t("demoWiki.intro"))]),

    heading(2, t("demoWiki.formattingTitle")),
    paragraph([text(t("demoWiki.formattingLinkBody"))]),
    paragraph([text(t("demoWiki.formattingStyleBody"))]),
    paragraph([
      text(t("demoWiki.example") + " "),
      text(t("editor.bold"), [{ type: "bold" }]),
      text(" / "),
      text(t("editor.italic"), [{ type: "italic" }]),
      text(" "),
      footnote(t("demoWiki.footnoteExample")),
    ]),
    { type: "blockquote", content: [paragraph([text(t("demoWiki.formattingQuote"))])] },
    paragraph([text(t("demoWiki.formattingImageBody"))]),

    heading(2, t("demoWiki.organizingTitle")),
    bulletList([
      t("demoWiki.organizingBullet1"),
      t("demoWiki.organizingBullet2"),
      t("demoWiki.organizingBullet3"),
      t("demoWiki.organizingBullet4"),
    ]),

    heading(2, t("demoWiki.navTitle")),
    paragraph([text(t("demoWiki.navTocBody"))]),
    paragraph([text(t("demoWiki.navGraphBody"))]),

    heading(2, t("demoWiki.multiWikiTitle")),
    paragraph([text(t("demoWiki.multiWikiBody1"))]),
    paragraph([text(t("demoWiki.multiWikiBody2"))]),

    heading(2, t("demoWiki.interfaceTitle")),
    paragraph([text(t("demoWiki.interfaceBody"))]),

    heading(2, t("demoWiki.usesTitle")),
    bulletList([
      t("demoWiki.usesBullet1"),
      t("demoWiki.usesBullet2"),
      t("demoWiki.usesBullet3"),
      t("demoWiki.usesBullet4"),
      t("demoWiki.usesBullet5"),
    ]),

    paragraph([text(t("demoWiki.templatesFooter"))]),
  ];
}

function crossLinkParagraph(lang: Lang, targetId: string, targetTitle: string): JSONContent {
  const t = (key: string) => translate(lang, key);
  return paragraph([
    text(t("demoWiki.crossLinkPrefix")),
    wikiLink(targetId, targetTitle),
    text(t("demoWiki.crossLinkSuffix")),
  ]);
}

// Builds an example record (auto-created on signup): a Templates folder with three
// starter documents (in the signer's language), and a Welcome folder holding a pair of
// cross-linked "Welcome to Aster" documents — one English, one Korean — regardless of
// signup language, so the wikilink at the top of each is also a live example of the feature.
export async function createDemoWiki(ownerId: string, lang: Lang) {
  const t = (key: string) => translate(lang, key);

  const wiki = await prisma.wiki.create({
    data: { title: t("demoWiki.title"), ownerId },
  });

  const folderTitle = t("demoWiki.templatesFolder");
  const templatesFolder = await prisma.document.create({
    data: {
      wikiId: wiki.id,
      title: folderTitle,
      slug: slugify(folderTitle),
      isFolder: true,
      status: "PUBLISHED",
      content: EMPTY_DOC,
    },
  });

  const projectTitle = t("demoWiki.tpl.project.title");
  await prisma.document.create({
    data: {
      wikiId: wiki.id,
      parentId: templatesFolder.id,
      title: projectTitle,
      slug: slugify(projectTitle),
      status: "PUBLISHED",
      content: projectTemplateContent(lang),
    },
  });

  const meetingTitle = t("demoWiki.tpl.meeting.title");
  await prisma.document.create({
    data: {
      wikiId: wiki.id,
      parentId: templatesFolder.id,
      title: meetingTitle,
      slug: slugify(meetingTitle),
      status: "PUBLISHED",
      content: meetingTemplateContent(lang),
    },
  });

  const studyTitle = t("demoWiki.tpl.study.title");
  await prisma.document.create({
    data: {
      wikiId: wiki.id,
      parentId: templatesFolder.id,
      title: studyTitle,
      slug: slugify(studyTitle),
      status: "PUBLISHED",
      content: studyTemplateContent(lang),
    },
  });

  const welcomeFolderTitle = t("demoWiki.welcomeFolder");
  const welcomeFolder = await prisma.document.create({
    data: {
      wikiId: wiki.id,
      title: welcomeFolderTitle,
      slug: slugify(welcomeFolderTitle),
      isFolder: true,
      status: "PUBLISHED",
      content: EMPTY_DOC,
    },
  });

  const enTitle = translate("en", "demoWiki.welcomeTitleEn");
  const enDoc = await prisma.document.create({
    data: {
      wikiId: wiki.id,
      parentId: welcomeFolder.id,
      title: enTitle,
      slug: slugify(enTitle),
      status: "PUBLISHED",
      content: { type: "doc", content: welcomeSections("en") } satisfies JSONContent,
    },
  });

  const koTitle = translate("ko", "demoWiki.welcomeTitleKo");
  const koDoc = await prisma.document.create({
    data: {
      wikiId: wiki.id,
      parentId: welcomeFolder.id,
      title: koTitle,
      slug: slugify(koTitle),
      status: "PUBLISHED",
      content: {
        type: "doc",
        content: [crossLinkParagraph("ko", enDoc.id, enTitle), ...welcomeSections("ko")],
      } satisfies JSONContent,
    },
  });

  await prisma.document.update({
    where: { id: enDoc.id },
    data: {
      content: {
        type: "doc",
        content: [crossLinkParagraph("en", koDoc.id, koTitle), ...welcomeSections("en")],
      } satisfies JSONContent,
    },
  });

  return wiki;
}
