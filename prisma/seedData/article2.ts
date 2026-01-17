import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types";

export const article2: SeedArticleData = {
  id: "art_2",
  title: "マーケ施策を動かす前に、必ず言語化しているゴールの置き方",
  userId: "u_marketing",
  topicId: "tag_pattern",
  topImageUrl: "https://picsum.photos/id/11/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "マーケ施策を動かす前に、必ず言語化しているゴールの置き方",
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
            "マーケティング施策を検討するとき、施策内容や手法のアイデアから考え始めてしまうことは少なくありません。\n" +
            "しかし、その状態で進めてしまうと、途中で「結局、何を目指していたのか分からない」という状況に陥りがちです。\n\n" +
            "そのため私は、施策を具体化する前に、必ず「ゴールの置き方」を言語化することから始めています。",
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
          text: "なぜゴールを先に言語化するのか",
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
            "ゴールが曖昧なまま施策を進めると、次のような問題が起こります。\n\n" +
            "- 成果の評価基準が人によって異なる\n" +
            "- 途中で施策の是非を判断できない\n" +
            "- 数字は見ているが、前進している実感が持てない\n\n" +
            "これらを防ぐために重要なのが、「この取り組みは、何が変われば成功なのか」を最初に言葉にすることです。",
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
        { type: "text", text: "数字だけでゴールを置かない", styles: {} },
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
            "もちろん、KPIや数値目標は重要です。\n" +
            "ただし、それだけをゴールにすると、判断に迷う場面が増えてしまいます。\n\n" +
            "そこで私は、数字に加えて次の視点を必ず整理します。\n\n" +
            "- 施策がうまくいったと言えるのは、どんな状態か\n" +
            "- チームや関係者の行動はどう変わっていてほしいか\n\n" +
            "「状態」を言語化することで、数値が一時的にブレた場合でも、冷静に状況を判断できるようになります。",
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
          text: "「何が分かれば前進か」を明確にする",
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
            "マーケティング施策は、一度で完璧な成果が出ることはほとんどありません。\n" +
            "だからこそ、「今回の施策で何が分かれば前進と言えるのか」を事前に決めておきます。\n\n" +
            "例えば、\n\n" +
            "- 仮説が正しかったかどうかが分かる\n" +
            "- 次に試すべき打ち手が明確になる\n\n" +
            "といったように、「学び」をゴールの一部として組み込みます。\n\n" +
            "これにより、途中で「意味があったのか分からない施策」になることを防げます。",
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
      content: [{ type: "text", text: "ゴールは判断軸として使う", styles: {} }],
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
            "言語化したゴールは、施策を評価するためだけのものではありません。\n" +
            "進行中の判断軸として活用します。\n\n" +
            "- この判断は、ゴールに近づいているか\n" +
            "- 今やろうとしていることは、目的に沿っているか\n\n" +
            "こうした確認を繰り返すことで、施策のブレを最小限に抑えることができます。",
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
            "施策を考える前にゴールを言語化することは、一見すると遠回りに見えるかもしれません。\n" +
            "しかし実際には、途中で迷う時間や手戻りを減らし、結果としてスピードを上げてくれます。\n\n" +
            "マーケティング施策に限らず、何かを動かす前に\n" +
            "「何が変われば成功なのか」\n" +
            "「何が分かれば前進なのか」\n" +
            "を一度立ち止まって言葉にしてみることをおすすめします。",
          styles: {},
        },
      ],
      children: [],
    },
  ],
  tags: {
    create: [
      { tagId: "industry_saas" },
      { tagId: "role_marketing" },
      { tagId: "phase_growth" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-02T10:00:00Z"),
  viewCount: 178,
  likeCount: 15,
  createdAt: new Date("2024-12-02T09:15:00Z"),
  updatedAt: new Date("2024-12-02T09:45:00Z"),
};
