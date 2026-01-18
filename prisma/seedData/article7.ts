import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article7: SeedArticleData = {
  id: "art_7",
  title: "Notionを議事録で終わらせないためにやっていること",
  userId: "u_sales",
  topicId: "tag_tool",
  topImageUrl: "https://picsum.photos/id/16/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "Notionを議事録で終わらせないためにやっていること",
          styles: {},
        },
      ],
      children: [],
    },

    {
      id: "2",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "はじめに", styles: {} }],
      children: [],
    },
    {
      id: "3",
      type: "paragraph",
      props: {},
      content: [
        {
          type: "text",
          text:
            "Notionは議事録やメモを残すツールとして広く使われています。\n" +
            "しかし実際の運用では、「書いてはいるが、後から見返されない」「単なる記録で終わっている」という状態になりがちです。\n\n" +
            "そこで本記事では、Notionを単なる議事録ではなく、実務で使われ続ける情報として残すために意識していることを整理します。",
          styles: {},
        },
      ],
      children: [],
    },

    { id: "4", type: "divider", props: {}, content: [], children: [] },

    {
      id: "5",
      type: "heading",
      props: { level: 2 },
      content: [
        {
          type: "text",
          text: "議事録を「記録」ではなく「判断の履歴」として扱う",
          styles: {},
        },
      ],
      children: [],
    },
    {
      id: "6",
      type: "paragraph",
      props: {},
      content: [
        {
          type: "text",
          text:
            "意識しているのは、会話の内容をそのまま書き起こすことではありません。\n" +
            "「どんな判断が、どんな理由で行われたのか」を残すことです。\n\n" +
            "- 何を決めたのか\n" +
            "- なぜその結論になったのか\n" +
            "- どんな選択肢があったのか\n\n" +
            "これらが分かる形で残っていれば、後から経緯を追うことができます。",
          styles: {},
        },
      ],
      children: [],
    },

    { id: "7", type: "divider", props: {}, content: [], children: [] },

    {
      id: "8",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "後から読む人を前提に書く", styles: {} }],
      children: [],
    },
    {
      id: "9",
      type: "paragraph",
      props: {},
      content: [
        {
          type: "text",
          text:
            "Notionに書かれた情報は、書いた本人だけが読むとは限りません。\n" +
            "数か月後の自分や、別のメンバーが読む可能性を前提にしています。\n\n" +
            "そのため、\n\n" +
            "- 前提条件や背景を簡潔に書く\n" +
            "- 当時の状況が分かる補足を残す\n\n" +
            "といった点を意識しています。",
          styles: {},
        },
      ],
      children: [],
    },

    { id: "10", type: "divider", props: {}, content: [], children: [] },

    {
      id: "11",
      type: "heading",
      props: { level: 2 },
      content: [
        {
          type: "text",
          text: "判断が変わったときこそ価値が出る",
          styles: {},
        },
      ],
      children: [],
    },
    {
      id: "12",
      type: "paragraph",
      props: {},
      content: [
        {
          type: "text",
          text:
            "判断の履歴を残しておくと、方針が変わったときに真価を発揮します。\n\n" +
            "- なぜ以前はその判断だったのか\n" +
            "- どの前提が変わったのか\n\n" +
            "これが分かることで、不要な議論のやり直しを防げます。",
          styles: {},
        },
      ],
      children: [],
    },

    { id: "13", type: "divider", props: {}, content: [], children: [] },

    {
      id: "14",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "会話の質が変わる", styles: {} }],
      children: [],
    },
    {
      id: "15",
      type: "paragraph",
      props: {},
      content: [
        {
          type: "text",
          text:
            "経緯が追える状態が続くと、会議や打ち合わせでの会話の質も変わってきます。\n\n" +
            "「前回はどうだったか」ではなく、\n" +
            "「なぜそう判断したか」を前提に議論できるようになるからです。",
          styles: {},
        },
      ],
      children: [],
    },

    { id: "16", type: "divider", props: {}, content: [], children: [] },

    {
      id: "17",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "おわりに", styles: {} }],
      children: [],
    },
    {
      id: "18",
      type: "paragraph",
      props: {},
      content: [
        {
          type: "text",
          text:
            "Notionを活用する目的は、情報をたくさん残すことではありません。\n" +
            "判断の背景と流れを共有し、次の意思決定を楽にすることだと考えています。\n\n" +
            "議事録が増えているだけで活用されていないと感じたときは、\n" +
            "「これは判断の履歴として残せているか」\n" +
            "という視点で見直してみてください。",
          styles: {},
        },
      ],
      children: [],
    },
  ],
  tags: {
    create: [
      { tagId: "industry-it-internet-saas-software" },
      { tagId: "job-sales-cs-customer-retention-support-customer-success" },
      { tagId: "skill-project-management" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-07T11:30:00Z"),
  viewCount: 198,
  likeCount: 25,
  createdAt: new Date("2024-12-07T11:00:00Z"),
  updatedAt: new Date("2024-12-07T11:20:00Z"),
};
