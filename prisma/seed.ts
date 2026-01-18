// seed.ts
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import {
  tagSeedData,
  article1,
  article2,
  article3,
  article4,
  article5,
  article6,
  article7,
  article8,
  article9,
} from "./seedData";

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
  await prisma.taxonomyType.deleteMany();
  await prisma.topic.deleteMany();

  // =====================
  // タクソノミータイプマスタデータ
  // =====================
  await prisma.taxonomyType.createMany({
    data: [
      {
        id: "taxonomy_industry",
        code: "INDUSTRY",
        displayName: "業界",
        description: "業界・領域分類",
        sortOrder: 1,
      },
      {
        id: "taxonomy_job_category",
        code: "JOB_CATEGORY", 
        displayName: "職種",
        description: "職種・役割分類",
        sortOrder: 2,
      },
      {
        id: "taxonomy_position",
        code: "POSITION",
        displayName: "役職・立場",
        description: "組織内での役職・立場",
        sortOrder: 3,
      },
      {
        id: "taxonomy_situation",
        code: "SITUATION",
        displayName: "状況",
        description: "ワークスタイル・環境",
        sortOrder: 4,
      },
      {
        id: "taxonomy_skill_method",
        code: "SKILL_METHOD",
        displayName: "スキル・メソッド",
        description: "技術スキル・メソッド",
        sortOrder: 5,
      },
      {
        id: "taxonomy_knowledge",
        code: "KNOWLEDGE",
        displayName: "ナレッジ",
        description: "専門知識・理論",
        sortOrder: 6,
      },
    ],
  });

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
  // 新しい階層タグシステム
  // =====================
  // タクソノミータイプのcodeからIDをマッピング
  const taxonomyMapping = {
    INDUSTRY: "taxonomy_industry",
    JOB_CATEGORY: "taxonomy_job_category", 
    POSITION: "taxonomy_position",
    SITUATION: "taxonomy_situation",
    SKILL_METHOD: "taxonomy_skill_method",
    KNOWLEDGE: "taxonomy_knowledge",
  };

  await prisma.tag.createMany({
    data: tagSeedData.map(tag => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      parentId: tag.parentId,
      level: tag.level,
      taxonomyTypeId: taxonomyMapping[tag.taxonomyTypeCode as keyof typeof taxonomyMapping],
      sortOrder: tag.sortOrder,
    })),
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
    article1,
    article2,
    article3,

    // --- しくじりの教訓（1） ---
    article4,

    // --- 仕事の信念（2） ---
    article5,
    article6,

    // --- 道具の活用術（2） ---
    article7,
    article8,

    // --- 現場の不条理（1） ---
    article9,
  ];

  for (const article of articles) {
    try {
      console.log(`記事を作成中: ${article.title} (ID: ${article.id})`);
      await prisma.article.create({ data: article });
      console.log(`✓ 記事作成成功: ${article.id}`);
    } catch (error) {
      console.error(`❌ 記事作成失敗: ${article.id}`);
      console.error('エラー:', error);
      throw error;
    }
  }

  console.log("🌱 Works Logue seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
