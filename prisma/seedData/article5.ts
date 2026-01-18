import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article5: SeedArticleData = {
  id: "art_5",
  title: "今すぐ決めない、という選択も意思決定の一つ",
  userId: "u_marketing",
  topicId: "tag_belief",
  topImageUrl: "https://picsum.photos/id/14/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "今すぐ決めない、という選択も意思決定の一つ",
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
            "仕事の現場では、「早く決めること」自体が評価される場面が多くあります。\n" +
            "そのため、情報が十分に揃っていない状態でも、何らかの結論を出そうとしてしまいがちです。\n\n" +
            "しかし実際には、「今は決めない」と判断することも、重要な意思決定の一つだと考えています。",
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
          text: "情報が足りない判断は、後から修正が入る",
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
            "経験上、判断に必要な情報が不足したまま決めたことは、後から高い確率で修正が入ります。\n\n" +
            "- 前提条件が変わる\n" +
            "- 想定していなかった制約が見つかる\n" +
            "- 新しい情報が追加で判明する\n\n" +
            "結果として、二度手間や関係者への再説明が発生し、余計に時間を使ってしまいます。",
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
      content: [
        {
          type: "text",
          text: "「何が足りないか」を明確にする",
          styles: {},
        },
      ],
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
            "そこで意識しているのが、「今は決めない」という判断をする際に、必ず理由を言語化することです。\n\n" +
            "- 何の情報が不足しているのか\n" +
            "- それは誰が、いつまでに用意するのか\n" +
            "- どの状態になれば判断できるのか\n\n" +
            "これらを整理することで、「先送り」と「意図的な保留」を明確に区別できます。",
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
          text: "決めない判断も、前に進んでいる",
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
            "判断を保留すると、「止まっている」「逃げている」と見られることがあります。\n" +
            "しかし、必要な情報を整理し、次のアクションが明確であれば、それは前進です。\n\n" +
            "むしろ、何も考えずに決めてしまう方が、後戻りのリスクは高くなります。",
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
      content: [{ type: "text", text: "おわりに", styles: {} }],
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
            "意思決定とは、必ずしも「結論を出すこと」だけではありません。\n" +
            "「今は決めない」「決めるために何が必要かを明確にする」ことも、立派な意思決定です。\n\n" +
            "判断を急ぐ場面こそ、一度立ち止まり、\n" +
            "「本当に今、決めるべきか」\n" +
            "を問い直す余裕を持ちたいと考えています。",
          styles: {},
        },
      ],
      children: [],
    },
  ],
  tags: {
    create: [
      { tagId: "industry-it-internet-saas-software" },
      { tagId: "job-marketing-planning" },
      { tagId: "position-manager" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-05T14:20:00Z"),
  viewCount: 203,
  likeCount: 18,
  createdAt: new Date("2024-12-05T13:45:00Z"),
  updatedAt: new Date("2024-12-05T14:10:00Z"),
};
