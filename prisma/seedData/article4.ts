import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article4: SeedArticleData = {
  id: "art_4",
  title: "早く決めたつもりが、後から一番時間を使った判断",
  userId: "u_sales",
  topicId: "tag_failure",
  topImageUrl: "https://picsum.photos/id/13/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "早く決めたつもりが、後から一番時間を使った判断",
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
            "仕事では「スピード感を持って進めること」が求められる場面が多くあります。\n" +
            "そのため、十分に考えきれないままでも、「とりあえず決めて進める」判断をしてしまうことがあります。\n\n" +
            "しかし振り返ってみると、早く決めたつもりの判断ほど、後から一番時間を使っていることがあります。\n" +
            "本記事では、その経験から得た教訓を整理します。",
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
        { type: "text", text: "その場では正解に見えた判断", styles: {} },
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
            "当時は、スケジュールや周囲の期待を意識し、深く検討する時間を取らずに決断しました。\n" +
            "その場では「前に進んだ」という感覚があり、悪い判断だとは思っていませんでした。\n\n" +
            "しかし、実際に進め始めてから問題が表面化します。\n\n" +
            "- なぜその判断をしたのか説明できない\n" +
            "- 関係者からの納得が得られない\n" +
            "- 想定していなかった調整が次々と発生する\n\n" +
            "結果として、後から何度も説明や修正に時間を取られることになりました。",
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
          text: "急ぐことと、雑に決めることは違う",
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
            "この経験から強く感じたのは、「急ぐこと」と「雑に決めること」は別物だということです。\n\n" +
            "短時間でも、\n" +
            "- 判断の理由は何か\n" +
            "- 他にどんな選択肢があったか\n" +
            "- 何を優先した結果なのか\n\n" +
            "これらを整理しておけば、後からの説明や調整は大幅に減らせます。",
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
          text: "早く決めるために、考える時間を取る",
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
            "一見矛盾しているようですが、早く進めるためには、最初に考える時間を取ることが重要です。\n\n" +
            "判断の軸が整理されていれば、\n" +
            "- 迷いが減る\n" +
            "- 追加の説明が不要になる\n" +
            "- 修正が発生しにくくなる\n\n" +
            "結果として、トータルの時間は短くなります。",
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
            "スピードを意識するあまり、考えるプロセスを省略してしまうと、後から必ずそのツケを払うことになります。\n\n" +
            "「早く決める」ためにこそ、\n" +
            "「なぜそう決めたのか」を説明できる状態で判断する。\n" +
            "この意識を持つことが、結果的に仕事のスピードと質を高めてくれると感じています。",
          styles: {},
        },
      ],
      children: [],
    },
  ],
  tags: {
    create: [
      { tagId: "industry_b2b" },
      { tagId: "role_sales" },
      { tagId: "role_manager" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-04T09:30:00Z"),
  viewCount: 156,
  likeCount: 12,
  createdAt: new Date("2024-12-04T09:00:00Z"),
  updatedAt: new Date("2024-12-04T09:15:00Z"),
};
