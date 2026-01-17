import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article9: SeedArticleData = {
  id: "art_9",
  title: "忙しいのに、なぜか前に進んでいない感覚",
  userId: "u_hr",
  topicId: "tag_buglog",
  topImageUrl: "https://picsum.photos/id/18/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "忙しいのに、なぜか前に進んでいない感覚",
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
            "日々の業務は常にタスクで埋まっている。\n" +
            "会議も多く、対応すべきことは次々と発生している。\n" +
            "それにもかかわらず、「前に進んでいる実感がない」と感じることがあります。\n\n" +
            "本記事では、その違和感をそのまま言葉にして整理します。",
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
          text: "タスクはこなしているが、成果が積み上がらない",
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
            "スケジュールは埋まり、やることは明確です。\n" +
            "しかし振り返ると、何が前進したのか説明できない状態になっています。\n\n" +
            "- 会議は増えている\n" +
            "- 資料やメモは増えている\n" +
            "- その場の対応は終わっている\n\n" +
            "それでも、成果として積み上がっている感覚が持てません。",
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
      content: [{ type: "text", text: "判断が先送りされている", styles: {} }],
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
            "原因の一つとして感じているのが、判断の先送りです。\n\n" +
            "- 重要な決定が「次回検討」になる\n" +
            "- 誰が決めるのかが曖昧なまま進む\n" +
            "- 結論の出ない議論が繰り返される\n\n" +
            "その結果、動いてはいるものの、方向は定まらない状態になります。",
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
      content: [{ type: "text", text: "責任の所在が見えにくい", styles: {} }],
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
            "もう一つの違和感は、責任の所在が曖昧になっていることです。\n\n" +
            "- 誰の判断なのか分からない\n" +
            "- 決めた人が見えない\n" +
            "- 後から説明できない\n\n" +
            "こうした状態では、前に進んでいる実感を持つことは難しくなります。",
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
      content: [{ type: "text", text: "まだ答えは出ていない", styles: {} }],
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
            "現時点で、明確な解決策があるわけではありません。\n" +
            "ただ、この状態をなかったことにせず、そのまま記録しておくことには意味があると感じています。\n\n" +
            "違和感を言葉にし、残しておくことで、\n" +
            "いつか状況が変わったときに、振り返る材料になるからです。",
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
            "忙しさと前進は、必ずしも比例しません。\n" +
            "むしろ、判断や責任が曖昧になるほど、「動いているのに進んでいない」感覚は強くなります。\n\n" +
            "今はまだ整理の途中ですが、\n" +
            "この違和感を言語化し続けること自体が、次の一歩につながると考えています。",
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
      { tagId: "role_orgdev" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-09T10:00:00Z"),
  viewCount: 67,
  likeCount: 4,
  createdAt: new Date("2024-12-09T09:20:00Z"),
  updatedAt: new Date("2024-12-09T09:45:00Z"),
};
