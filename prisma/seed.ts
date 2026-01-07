// seed.ts
import { PrismaClient, ArticleStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // =====================
  // 初期化
  // =====================
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.userOccupation.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.occupation.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.occupationCategory.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.topic.deleteMany();

  // =====================
  // 管理者ユーザー作成
  // =====================
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const hashedPassword = await bcrypt.hash("admin123!", 12);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        displayName: "Administrator",
        userId: "admin",
        role: "ADMIN",
        emailVerified: true,
      },
    });

    await prisma.account.create({
      data: {
        userId: adminUser.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: adminEmail, // emailを使用
        access_token: hashedPassword,
      },
    });

    console.log(`管理者ユーザーを作成しました: ${adminEmail}`);
  }

  // =====================
  // スキルカテゴリマスタデータ
  // =====================
  await prisma.skillCategory.createMany({
    data: [
      {
        id: "skill_business",
        key: "business",
        name: "ビジネス・マネジメント",
        description: "ビジネス全般に関わる基本的なスキル",
      },
      {
        id: "skill_marketing",
        key: "marketing",
        name: "マーケティング",
        description: "市場分析・顧客理解・施策企画に関するスキル",
      },
      {
        id: "skill_sales",
        key: "sales",
        name: "営業・セールス",
        description: "営業活動・顧客対応に関するスキル",
      },
      {
        id: "skill_management",
        key: "management",
        name: "組織マネジメント",
        description: "チーム運営・プロジェクト管理に関するスキル",
      },
      {
        id: "skill_operation",
        key: "operation",
        name: "業務運営・改善",
        description: "業務プロセス・運用改善に関するスキル",
      },
    ],
  });

  // =====================
  // 職業カテゴリマスタデータ
  // =====================
  await prisma.occupationCategory.createMany({
    data: [
      {
        id: "occ_business",
        key: "business",
        name: "ビジネス・企画",
        description: "事業企画・戦略立案を担う職種",
      },
      {
        id: "occ_marketing",
        key: "marketing",
        name: "マーケティング・営業",
        description: "マーケティング・営業活動を担う職種",
      },
      {
        id: "occ_sales",
        key: "sales",
        name: "営業・セールス",
        description: "営業・販売活動を担う職種",
      },
      {
        id: "occ_management",
        key: "management",
        name: "マネジメント",
        description: "組織・プロジェクト管理を担う職種",
      },
      {
        id: "occ_corporate",
        key: "corporate",
        name: "コーポレート・管理",
        description: "人事・総務・経理などの管理部門職種",
      },
    ],
  });

  // =====================
  // スキルマスタデータ
  // =====================
  await prisma.skill.createMany({
    data: [
      // =====================
      // ビジネス基礎スキル
      // =====================
      {
        name: "論理的思考",
        description: "情報を整理し、筋道立てて考える能力",
        categoryId: "skill_business",
      },
      {
        name: "課題解決力",
        description: "課題を特定し、解決策を立案・実行する能力",
        categoryId: "skill_business",
      },
      {
        name: "資料作成",
        description: "提案書・報告書などのビジネス資料作成",
        categoryId: "skill_business",
      },
      {
        name: "プレゼンテーション",
        description: "相手に分かりやすく伝える説明・発表スキル",
        categoryId: "skill_business",
      },
      {
        name: "コミュニケーション",
        description: "社内外の関係者と円滑に意思疎通を行う能力",
        categoryId: "skill_business",
      },

      // =====================
      // マーケティング・企画
      // =====================
      {
        name: "市場分析",
        description: "市場や顧客動向を調査・分析する能力",
        categoryId: "skill_marketing",
      },
      {
        name: "顧客理解",
        description: "顧客ニーズや課題を把握する力",
        categoryId: "skill_marketing",
      },
      {
        name: "企画立案",
        description: "施策やプロジェクトを企画する能力",
        categoryId: "skill_marketing",
      },
      {
        name: "プロモーション企画",
        description: "販促施策の立案・実行",
        categoryId: "skill_marketing",
      },

      // =====================
      // 営業・折衝
      // =====================
      {
        name: "提案力",
        description: "顧客課題に対して適切な提案を行う能力",
        categoryId: "skill_sales",
      },
      {
        name: "交渉力",
        description: "条件調整や合意形成を行う能力",
        categoryId: "skill_sales",
      },
      {
        name: "関係構築",
        description: "顧客・取引先との信頼関係構築",
        categoryId: "skill_sales",
      },

      // =====================
      // マネジメント
      // =====================
      {
        name: "プロジェクト推進",
        description: "関係者を巻き込みながら業務を前に進める能力",
        categoryId: "skill_management",
      },
      {
        name: "進捗管理",
        description: "業務・タスクの進捗を管理する能力",
        categoryId: "skill_management",
      },
      {
        name: "意思決定",
        description: "状況に応じて判断を下す能力",
        categoryId: "skill_management",
      },

      // =====================
      // オペレーション
      // =====================
      {
        name: "業務改善",
        description: "業務フローの課題を見つけ改善する能力",
        categoryId: "skill_operation",
      },
      {
        name: "ルール設計",
        description: "業務ルールや運用方針を整備する能力",
        categoryId: "skill_operation",
      },
    ],
  });

  // =====================
  // 職業マスタデータ
  // =====================
  await prisma.occupation.createMany({
    data: [
      // =====================
      // ビジネス・企画系
      // =====================
      {
        name: "事業企画",
        description: "事業戦略の立案・推進を行う職種",
        categoryId: "occ_business",
      },
      {
        name: "経営企画",
        description: "中長期戦略や経営方針の策定を担う",
        categoryId: "occ_business",
      },
      {
        name: "商品企画",
        description: "商品・サービスの企画立案を行う",
        categoryId: "occ_business",
      },

      // =====================
      // マーケティング
      // =====================
      {
        name: "マーケティング担当",
        description: "市場分析・販促施策を担当",
        categoryId: "occ_marketing",
      },
      {
        name: "ブランド担当",
        description: "ブランド価値向上のための施策立案",
        categoryId: "occ_marketing",
      },

      // =====================
      // 営業
      // =====================
      {
        name: "法人営業",
        description: "法人顧客への提案・販売を行う",
        categoryId: "occ_sales",
      },
      {
        name: "アカウントマネージャー",
        description: "既存顧客との関係構築・取引管理",
        categoryId: "occ_sales",
      },

      // =====================
      // マネジメント
      // =====================
      {
        name: "マネージャー",
        description: "チーム・部門の業務管理を行う",
        categoryId: "occ_management",
      },
      {
        name: "プロジェクトリーダー",
        description: "プロジェクトの進行管理・調整を担う",
        categoryId: "occ_management",
      },

      // =====================
      // コーポレート
      // =====================
      {
        name: "人事",
        description: "採用・人材育成・評価制度を担当",
        categoryId: "occ_corporate",
      },
      {
        name: "総務",
        description: "社内環境・制度運用を支える職種",
        categoryId: "occ_corporate",
      },
      {
        name: "経理・財務",
        description: "会計・財務管理を行う職種",
        categoryId: "occ_corporate",
      },
    ],
  });

  // =====================
  // Topic（9つ・固定）
  // =====================
  await prisma.topic.createMany({
    data: [
      {
        id: "tag_pattern",
        name: "実務の型",
        description:
          "成功パターンの手順書。誰がやっても成果が出るワークフロー。",
      },
      {
        id: "tag_failure",
        name: "しくじりの教訓",
        description: "失敗の原因分析と回避策。負債を資産に変える記録。",
      },
      {
        id: "tag_decision",
        name: "判断の軸",
        description: "迷った時の意思決定ルール。プロとしての見極め基準。",
      },
      {
        id: "tag_belief",
        name: "仕事の信念（スタンス）",
        description: "独自の視点や提言。なぜその仕事をするのかという「思想」。",
      },
      {
        id: "tag_tool",
        name: "道具の活用術",
        description: "ITツールやAIを現場にどう組み込んでいるか。",
      },
      {
        id: "tag_experiment",
        name: "検証の記録",
        description: "実際に試して得られた生々しい事実とデータ。",
      },
      {
        id: "tag_process",
        name: "仕組みの再構築",
        description: "非効率な業務を現代に合わせて作り直したプロセス。",
      },
      {
        id: "tag_buglog",
        name: "現場の不条理（ログ）",
        description: "解決策不要。現場にある理不尽な状態の「バグレポート」。",
      },
      {
        id: "tag_worry",
        name: "仕事の悩み・迷い",
        description: "解決策不要。現場で直面している「知恵の需要」の種。",
      },
    ],
  });

  // =====================
  // Tag
  // =====================
  await prisma.tag.createMany({
    data: [
      // =====================
      // 業界
      // =====================
      {
        id: "industry_b2b",
        name: "BtoB",
        description: "法人向けに商品・サービスを提供するビジネス領域。",
      },
      {
        id: "industry_web_it",
        name: "Web・IT",
        description: "WebサービスやITプロダクトを中心とした業界。",
      },
      {
        id: "industry_saas",
        name: "SaaS",
        description: "SaaS型のプロダクト・事業を展開している組織。",
      },
      {
        id: "industry_general",
        name: "一般企業",
        description: "特定のIT業界に限らない、一般的な事業会社。",
      },

      // =====================
      // 組織規模
      // =====================
      {
        id: "org_small",
        name: "小規模組織",
        description: "少人数で意思決定や実行が行われる組織。",
      },
      {
        id: "org_sme",
        name: "中小企業",
        description: "数十〜数百名規模で運営される企業・組織。",
      },
      {
        id: "org_mid",
        name: "中堅企業",
        description: "一定の組織階層と業務分業が進んだ企業。",
      },
      {
        id: "org_large",
        name: "大企業",
        description: "大規模な組織構造と複数の意思決定レイヤーを持つ企業。",
      },

      // =====================
      // 立場・ロール
      // =====================
      {
        id: "role_bizdev",
        name: "事業開発",
        description: "新規事業や既存事業の成長を担う立場。",
      },
      {
        id: "role_sales",
        name: "営業",
        description: "顧客との折衝や提案、受注を担う立場。",
      },
      {
        id: "role_marketing",
        name: "マーケティング",
        description: "市場分析や施策設計を通じて成果創出を担う立場。",
      },
      {
        id: "role_hr",
        name: "人事",
        description: "採用・育成・制度設計など人に関わる領域を担う立場。",
      },
      {
        id: "role_orgdev",
        name: "組織企画",
        description: "組織構造や業務プロセスの設計・改善を担う立場。",
      },
      {
        id: "role_manager",
        name: "マネージャー",
        description: "意思決定やチームマネジメントを担う管理職。",
      },
      {
        id: "role_project",
        name: "プロジェクト推進",
        description: "部門横断で物事を前に進める実行責任を持つ立場。",
      },

      // =====================
      // 事業フェーズ
      // =====================
      {
        id: "phase_launch",
        name: "立ち上げ期",
        description: "事業や取り組みを立ち上げ、試行錯誤している段階。",
      },
      {
        id: "phase_growth",
        name: "成長期",
        description: "成果を拡大し、再現性やスケールを目指す段階。",
      },
      {
        id: "phase_stable",
        name: "安定期",
        description: "事業や業務が定着し、改善や最適化に注力する段階。",
      },
    ],
  });

  // =====================
  // User（3人・ブログっぽい表記）
  // =====================
  const pw = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        id: "u_sales",
        displayName: "田村 淳｜事業開発・営業",
        userId: "tamura_sales",
        email: "sales@workslogue.jp",
        bio: "事業開発と営業を担当。新規事業の立ち上げから既存顧客との関係構築まで幅広く経験。",
        statusMessage: "顧客課題から事業機会を見つけるのが得意です",
        location: "東京都",
      },
      {
        id: "u_marketing",
        displayName: "松本 恒一",
        userId: "matsumoto_marketing",
        email: "marketing@workslogue.jp",
        bio: "マーケティング戦略の立案・実行を専門とする。データドリブンなアプローチで成果創出に注力。",
        statusMessage: "データから価値を見つけ出します",
        location: "大阪府",
      },
      {
        id: "u_hr",
        displayName: "山本 麻衣｜人事・組織企画",
        userId: "yamamoto_hr",
        email: "hr@workslogue.jp",
        bio: "人事制度設計と組織開発を担当。採用から育成、評価制度まで一貫して取り組んでいます。",
        statusMessage: "人と組織の成長を支援します",
        location: "福岡県",
      },
    ],
  });

  await prisma.account.createMany({
    data: [
      {
        id: "a_sales",
        userId: "u_sales",
        type: "credentials",
        provider: "credentials",
        providerAccountId: "sales@workslogue.jp",
        access_token: pw,
      },
      {
        id: "a_marketing",
        userId: "u_marketing",
        type: "credentials",
        provider: "credentials",
        providerAccountId: "marketing@workslogue.jp",
        access_token: pw,
      },
      {
        id: "a_hr",
        userId: "u_hr",
        type: "credentials",
        provider: "credentials",
        providerAccountId: "hr@workslogue.jp",
        access_token: pw,
      },
    ],
  });

  // =====================
  // Article（9本）
  // =====================
  const articles = [
    // --- 実務の型（3） ---
    {
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
    },
    {
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
          content: [
            { type: "text", text: "ゴールは判断軸として使う", styles: {} },
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
    },
    {
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
    },

    // --- しくじりの教訓（1） ---
    {
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
    },

    // --- 仕事の信念（2） ---
    {
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
          { tagId: "industry_saas" },
          { tagId: "role_marketing" },
          { tagId: "role_manager" },
        ],
      },
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2024-12-05T14:20:00Z"),
      viewCount: 203,
      likeCount: 18,
      createdAt: new Date("2024-12-05T13:45:00Z"),
      updatedAt: new Date("2024-12-05T14:10:00Z"),
    },
    {
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
    },

    // --- 道具の活用術（2） ---
    {
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
          content: [
            { type: "text", text: "後から読む人を前提に書く", styles: {} },
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
          { tagId: "industry_b2b" },
          { tagId: "role_sales" },
          { tagId: "role_project" },
        ],
      },
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2024-12-07T11:30:00Z"),
      viewCount: 198,
      likeCount: 25,
      createdAt: new Date("2024-12-07T11:00:00Z"),
      updatedAt: new Date("2024-12-07T11:20:00Z"),
    },
    {
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
          content: [
            { type: "text", text: "思考を広げるために使う", styles: {} },
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
          content: [
            { type: "text", text: "最終判断は必ず自分で行う", styles: {} },
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
          { tagId: "industry_web_it" },
          { tagId: "role_marketing" },
          { tagId: "phase_growth" },
        ],
      },
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2024-12-08T15:10:00Z"),
      viewCount: 234,
      likeCount: 19,
      createdAt: new Date("2024-12-08T14:45:00Z"),
      updatedAt: new Date("2024-12-08T15:00:00Z"),
    },

    // --- 現場の不条理（1） ---
    {
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
          content: [
            { type: "text", text: "判断が先送りされている", styles: {} },
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
          content: [
            { type: "text", text: "責任の所在が見えにくい", styles: {} },
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
    },
  ];

  for (const article of articles) {
    await prisma.article.create({ data: article });
  }

  console.log("🌱 Works Logue seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
