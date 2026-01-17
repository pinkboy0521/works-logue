import { ArticleStatus } from "@prisma/client";
import { type SeedArticleData } from "./types.js";

export const article1: SeedArticleData = {
  id: "art_1",
  title: "要件が曖昧な相談を受けたとき、最初に必ずやっている整理",
  userId: "u_sales",
  topicId: "tag_pattern",
  topImageUrl: "https://picsum.photos/id/10/400/300",
  content: [
    {
      id: "1",
      type: "heading",
      props: { level: 1 },
      content: [
        {
          type: "text",
          text: "要件が曖昧な相談を受けたとき、最初に必ずやっている整理",
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
            "「とりあえず一度、相談させてください」。\n" +
            "事業開発や営業の現場では、この一言から始まる相談を受けることが少なくありません。\n\n" +
            "このような相談は、課題意識はあるものの、要件やゴールが言語化されていないケースが大半です。\n" +
            "そのまま話を進めてしまうと、途中で認識のズレが生じ、結果的に調整や説明に多くの時間を費やすことになります。\n\n" +
            "そこで本記事では、要件が曖昧な相談を受けた際に、最初に必ず行っている整理の考え方についてご紹介します。",
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
        { type: "text", text: "なぜ最初の整理が重要なのか", styles: {} },
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
            "要件が固まらないまま進めると、次のような問題が起こりやすくなります。\n\n" +
            "- 途中で前提条件が変わり、議論が振り出しに戻る\n" +
            "- 判断基準が曖昧なまま、意思決定が先送りされる\n" +
            "- 当初想定していなかった作業まで対応することになる\n\n" +
            "最初から完璧な合意を目指す必要はありません。\n" +
            "しかし、「混乱しやすいポイントを減らす」ための整理は、初動で必ず行うべきだと考えています。",
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
          text: "整理① 今回は「やらないこと」を先に決める",
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
            "最初に行うのは、今回やらないことを明確にすることです。\n\n" +
            "相談を受ける側は、つい「全部対応しよう」と考えがちですが、これが後々の負担や認識ズレにつながります。\n\n" +
            "- 今回のスコープ外は何か\n" +
            "- 今回は検討対象にしない論点は何か\n\n" +
            "これらを先に言語化して共有することで、期待値を適切に揃えることができます。",
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
          text: "整理② 成功の状態を一文で書き出す",
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
            "次に、「どうなっていれば今回の相談は成功か」を一文で表現します。\n\n" +
            "完璧な定義である必要はありません。\n" +
            "重要なのは、関係者全員が同じ方向を向ける最低限のゴールを持つことです。\n\n" +
            "一文で書くことで、\n" +
            "- 話が脱線していないか\n" +
            "- 今の議論がゴールに近づいているか\n\n" +
            "を随時確認できるようになります。",
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
          text: "整理③ 途中で判断が必要になりそうな点を洗い出す",
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
            "最後に、進行途中で判断が必要になりそうなポイントをあらかじめ洗い出します。\n\n" +
            "- 誰が判断するのか\n" +
            "- どのタイミングで判断が必要か\n" +
            "- 判断に必要な情報は何か\n\n" +
            "これらを事前に共有しておくだけで、後からの混乱や手戻りを大きく減らすことができます。",
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
      content: [
        {
          type: "text",
          text: "完璧な合意よりも、混乱を減らす",
          styles: {},
        },
      ],
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
            "要件が曖昧な相談に対して、最初から完璧な合意を取ることはほぼ不可能です。\n" +
            "しかし、「やらないこと」「成功の状態」「判断ポイント」を整理しておくだけで、プロジェクトの進み方は大きく変わります。\n\n" +
            "最初の整理は、スピードを落とすためのものではありません。\n" +
            "むしろ、後工程をスムーズに進めるための投資だと考えています。\n\n" +
            "同じような相談を受ける機会があれば、ぜひ一度、この整理を試してみてください。",
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
      { tagId: "org_sme" },
    ],
  },
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-12-01T10:00:00Z"),
  viewCount: 145,
  likeCount: 23,
  createdAt: new Date("2024-12-01T09:30:00Z"),
  updatedAt: new Date("2024-12-01T09:50:00Z"),
};
