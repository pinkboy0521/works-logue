import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article6: SeedArticleData = {
  id: "art_6",
  title: "説明できない判断は、後で必ず苦しくなる",
  userId: "u_hr",
  topicId: "tag_belief",
  topImageUrl: "https://picsum.photos/id/15/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "説明できない判断は、後で必ず苦しくなる",
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
            "仕事の中では、すべての判断に十分な時間をかけられるとは限りません。\n" +
            "その結果、「なんとなく」「雰囲気で」といった理由で判断してしまう場面も出てきます。\n\n" +
            "しかし振り返ると、説明できないまま下した判断ほど、後から自分を苦しめることが多いと感じています。",
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
          text: "「なんとなく決めた」は通用しない",
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
            "判断直後は問題なく進んでいるように見えても、時間が経つと必ず説明を求められます。\n\n" +
            "- なぜその判断をしたのか\n" +
            "- 他の選択肢は検討しなかったのか\n" +
            "- 当時、何を前提としていたのか\n\n" +
            "このときに言葉で説明できないと、信頼を損ねたり、不要な疑念を生んでしまいます。",
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
        { type: "text", text: "自分に対する最低限のチェック", styles: {} },
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
            "そのため私は、判断を下す前に\n" +
            "「これを文章で説明できるか」\n" +
            "を最低限のチェックとして行うようにしています。\n\n" +
            "完璧なロジックである必要はありません。\n" +
            "多少荒削りでも、自分の言葉で理由を書き出せるかどうかが重要です。",
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
          text: "説明できる判断は、修正もしやすい",
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
            "判断の理由が言語化されていれば、状況が変わったときにも対応しやすくなります。\n\n" +
            "- どの前提が崩れたのか\n" +
            "- 何が想定外だったのか\n" +
            "- どこを修正すればよいのか\n\n" +
            "説明できる判断は、間違っていた場合でも、次の判断につなげやすいのです。",
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
            "忙しいときほど、「考える時間」を削ってしまいがちです。\n" +
            "しかし、説明できない判断は、必ずどこかで自分に返ってきます。\n\n" +
            "少なくとも文章で説明できるかどうか。\n" +
            "この小さなチェックを習慣にするだけで、判断の質と後工程の負担は大きく変わると感じています。",
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
  publishedAt: new Date("2024-12-06T16:45:00Z"),
  viewCount: 89,
  likeCount: 7,
  createdAt: new Date("2024-12-06T16:00:00Z"),
  updatedAt: new Date("2024-12-06T16:30:00Z"),
};
