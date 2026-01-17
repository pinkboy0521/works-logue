import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article3: SeedArticleData = {
  id: "art_3",
  title: "引き継ぎ資料で、手順よりも優先して書いていること",
  userId: "u_hr",
  topicId: "tag_pattern",
  topImageUrl: "https://picsum.photos/id/12/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "引き継ぎ資料で、手順よりも優先して書いていること",
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
            "業務の引き継ぎ資料というと、手順や操作方法を細かく書くことに意識が向きがちです。\n" +
            "しかし実際の現場では、「書いてある通りにやったはずなのに、うまくいかない」という状況が少なからず発生します。\n\n" +
            "その原因の多くは、手順は分かっても「なぜそうしているのか」が分からないことにあります。\n" +
            "本記事では、引き継ぎ資料を作成する際に、手順よりも優先して書いているポイントについて整理します。",
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
        { type: "text", text: "手順だけの引き継ぎが生む問題", styles: {} },
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
            "手順中心の引き継ぎ資料には、次のような課題があります。\n\n" +
            "- 想定外のケースに対応できない\n" +
            "- 少し条件が変わると判断に迷う\n" +
            "- 細かい確認や質問が増える\n\n" +
            "結果として、引き継ぎ後も前任者への問い合わせが続き、業務が完全に移行しない状態になりがちです。",
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
        { type: "text", text: "「なぜそうしているか」を残す", styles: {} },
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
            "引き継ぎで最も重視しているのは、「なぜこのやり方を採用しているのか」という判断の背景です。\n\n" +
            "- なぜこの手順になっているのか\n" +
            "- 他の選択肢を取らなかった理由は何か\n" +
            "- 過去にどんな失敗や制約があったのか\n\n" +
            "これらを簡単にでも書き残しておくことで、引き継ぎを受けた側は状況に応じて適切な判断ができるようになります。",
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
          text: "判断の背景があると、質問は減る",
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
            "不思議なことに、判断の背景が書かれていると、細かい質問は自然と減っていきます。\n\n" +
            "理由が分かれば、\n" +
            "「この場合は例外かもしれない」\n" +
            "「ここは変えても問題なさそうだ」\n" +
            "と、自分で考えられるようになるからです。\n\n" +
            "引き継ぎ資料の目的は、作業をそのまま再現させることではなく、判断を引き継ぐことだと考えています。",
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
      content: [
        {
          type: "text",
          text: "完璧な資料よりも、考え方が伝わること",
          styles: {},
        },
      ],
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
            "すべてのケースを網羅した完璧な引き継ぎ資料を作ることは現実的ではありません。\n" +
            "それよりも、「この業務をどう考えているか」「何を大事にして判断しているか」が伝わる資料の方が、実務では役立ちます。",
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
            "引き継ぎ資料を書くときは、\n" +
            "「どうやるか」だけでなく\n" +
            "「なぜそうしているか」\n" +
            "を一段上の情報として残すことを意識しています。\n\n" +
            "判断の背景が共有されていれば、業務は人が変わっても安定して回り続けます。\n" +
            "引き継ぎの質を高めたいときこそ、この視点を取り入れてみてください。",
          styles: {},
        },
      ],
      children: [],
    },
  ],
  tags: {
    create: [
      { tagId: "industry_general" },
      { tagId: "role_hr" },
      { tagId: "phase_stable" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-03T10:00:00Z"),
  viewCount: 267,
  likeCount: 31,
  createdAt: new Date("2024-12-03T09:00:00Z"),
  updatedAt: new Date("2024-12-03T09:40:00Z"),
};
