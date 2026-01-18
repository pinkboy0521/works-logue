import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article8: SeedArticleData = {
  id: "art_8",
  title: "生成AIを壁打ち相手として使うときの距離感",
  userId: "u_marketing",
  topicId: "tag_tool",
  topImageUrl: "https://picsum.photos/id/17/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "生成AIを壁打ち相手として使うときの距離感",
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
            "生成AIが身近な存在になり、企画や文章作成、アイデア出しなど、さまざまな場面で活用されるようになりました。\n" +
            "一方で、「どこまで任せてよいのか」「判断を委ねてしまってよいのか」といった戸惑いを感じることもあります。\n\n" +
            "本記事では、生成AIを実務で使う際に意識している距離感について整理します。",
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
        { type: "text", text: "AIは答えを出す存在ではない", styles: {} },
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
            "生成AIを使う上で、最初に明確にしている前提があります。\n" +
            "それは、AIは「正解を出す存在」ではないということです。\n\n" +
            "- 自分の考えを言語化する補助\n" +
            "- 視点を増やすための壁打ち相手\n" +
            "- 見落としている論点に気づくきっかけ\n\n" +
            "こうした役割として捉えることで、使い方を誤りにくくなります。",
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
      content: [{ type: "text", text: "思考を広げるために使う", styles: {} }],
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
            "行き詰まったときや、考えが偏っていると感じたときに、AIに投げかけてみます。\n\n" +
            "- 他の切り口はないか\n" +
            "- 反対意見として考えられることは何か\n" +
            "- 抽象度を上げたり下げたりできないか\n\n" +
            "AIの返答をそのまま採用するのではなく、「考える材料」として受け取ることが重要です。",
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
      content: [{ type: "text", text: "最終判断は必ず自分で行う", styles: {} }],
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
            "どれだけ便利でも、最終的な判断は自分で行います。\n" +
            "この前提を崩してしまうと、判断の責任が曖昧になってしまいます。\n\n" +
            "- なぜその結論に至ったのか説明できるか\n" +
            "- 自分の意思として納得しているか\n\n" +
            "このチェックは、AIを使った後こそ意識しています。",
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
          text: "距離感を保つことで、使い続けられる",
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
            "AIに頼りすぎると、使うこと自体に不安や違和感が生まれます。\n" +
            "適切な距離感を保つことで、道具として長く使い続けることができます。",
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
            "生成AIは、考えることを代替する存在ではありません。\n" +
            "考えることを助けてくれる存在です。\n\n" +
            "壁打ち相手として活用しつつ、\n" +
            "判断と責任は必ず自分が持つ。\n" +
            "この姿勢を忘れなければ、生成AIは実務において非常に心強いパートナーになると感じています。",
          styles: {},
        },
      ],
      children: [],
    },
  ],
  tags: {
    create: [
      { tagId: "industry-it-internet" },
      { tagId: "job-marketing-planning" },
      { tagId: "situation-venture" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-08T15:10:00Z"),
  viewCount: 234,
  likeCount: 19,
  createdAt: new Date("2024-12-08T14:45:00Z"),
  updatedAt: new Date("2024-12-08T15:00:00Z"),
};
