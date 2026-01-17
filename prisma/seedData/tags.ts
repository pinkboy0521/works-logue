import { TagTaxonomyType } from "@prisma/client";

export interface TagSeedData {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  taxonomyType: TagTaxonomyType;
  sortOrder: number;
}

export const tagSeedData: TagSeedData[] = [
  // =====================
  // 1階層 - 業界
  // =====================
  {
    id: "it-internet",
    name: "IT・インターネット",
    description: "IT、ソフトウェア、インターネット関連業界",
    parentId: null,
    level: 1,
    taxonomyType: "INDUSTRY",
    sortOrder: 1,
  },
  {
    id: "consulting-professional",
    name: "コンサルティング・専門サービス",
    description: "経営戦略、業務改善、専門的サービス業",
    parentId: null,
    level: 1,
    taxonomyType: "INDUSTRY",
    sortOrder: 2,
  },
  {
    id: "manufacturing",
    name: "メーカー（製造業）",
    description: "製造業、工業、機械系産業",
    parentId: null,
    level: 1,
    taxonomyType: "INDUSTRY",
    sortOrder: 3,
  },
  {
    id: "trading-retail",
    name: "商社・流通・小売",
    description: "商社、流通、小売業界",
    parentId: null,
    level: 1,
    taxonomyType: "INDUSTRY",
    sortOrder: 4,
  },
  {
    id: "finance-insurance",
    name: "金融・保険",
    description: "銀行、証券、保険業界",
    parentId: null,
    level: 1,
    taxonomyType: "INDUSTRY",
    sortOrder: 5,
  },

  // =====================
  // 2階層 - IT・インターネット
  // =====================
  {
    id: "internet-services-ec",
    name: "インターネットサービス・EC",
    description: "ECサイト、Webサービス運営",
    parentId: "it-internet",
    level: 2,
    taxonomyType: "INDUSTRY",
    sortOrder: 1,
  },
  {
    id: "saas-software",
    name: "SaaS・ソフトウェア",
    description: "SaaS、パッケージソフトウェア開発",
    parentId: "it-internet",
    level: 2,
    taxonomyType: "INDUSTRY",
    sortOrder: 2,
  },
  {
    id: "digital-marketing",
    name: "デジタルマーケティング",
    description: "デジタル広告、マーケティングテクノロジー",
    parentId: "it-internet",
    level: 2,
    taxonomyType: "INDUSTRY",
    sortOrder: 3,
  },

  // =====================
  // 1階層 - 職種
  // =====================
  {
    id: "management-bizdev",
    name: "経営・事業開発",
    description: "経営企画、事業開発、新規事業創出",
    parentId: null,
    level: 1,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 1,
  },
  {
    id: "corporate-admin",
    name: "コーポレート（管理部門）",
    description: "人事、経理、法務等の管理部門",
    parentId: null,
    level: 1,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 2,
  },
  {
    id: "sales-customer-success",
    name: "営業・カスタマーサクセス",
    description: "営業、CS、カスタマーサポート",
    parentId: null,
    level: 1,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 3,
  },
  {
    id: "marketing-planning",
    name: "マーケティング・企画",
    description: "マーケティング、商品企画、PR",
    parentId: null,
    level: 1,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 4,
  },
  {
    id: "it-technology",
    name: "IT・テクノロジー",
    description: "エンジニア、開発者、IT専門職",
    parentId: null,
    level: 1,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 5,
  },

  // =====================
  // 2階層 - コーポレート（管理部門）
  // =====================
  {
    id: "hr-recruitment",
    name: "人事・採用",
    description: "人事企画、採用、人材開発",
    parentId: "corporate-admin",
    level: 2,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 1,
  },
  {
    id: "finance-accounting",
    name: "経理・財務",
    description: "経理、財務、管理会計",
    parentId: "corporate-admin",
    level: 2,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 2,
  },
  {
    id: "legal-ip",
    name: "法務・知財",
    description: "法務、コンプライアンス、知的財産",
    parentId: "corporate-admin",
    level: 2,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 3,
  },

  // =====================
  // 3階層 - 人事・採用
  // =====================
  {
    id: "recruitment-newgrad-mid",
    name: "採用（新卒/中途）",
    description: "採用活動、面接、採用企画",
    parentId: "hr-recruitment",
    level: 3,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 1,
  },
  {
    id: "hr-development-training",
    name: "人材開発・研修",
    description: "人材育成、研修企画、スキル開発",
    parentId: "hr-recruitment",
    level: 3,
    taxonomyType: "JOB_CATEGORY",
    sortOrder: 2,
  },

  // =====================
  // 役割・立場（フラット構造）
  // =====================
  {
    id: "executive-officer",
    name: "経営者・役員",
    description: "代表取締役、役員クラス",
    parentId: null,
    level: 1,
    taxonomyType: "POSITION",
    sortOrder: 1,
  },
  {
    id: "department-manager",
    name: "事業責任者・部門長",
    description: "事業部長、部門責任者",
    parentId: null,
    level: 1,
    taxonomyType: "POSITION",
    sortOrder: 2,
  },
  {
    id: "team-manager",
    name: "マネージャー/課長",
    description: "チームマネージャー、課長職",
    parentId: null,
    level: 1,
    taxonomyType: "POSITION",
    sortOrder: 3,
  },
  {
    id: "team-leader",
    name: "リーダー",
    description: "チームリーダー、主任職",
    parentId: null,
    level: 1,
    taxonomyType: "POSITION",
    sortOrder: 4,
  },
  {
    id: "specialist",
    name: "スペシャリスト",
    description: "専門職、エキスパート",
    parentId: null,
    level: 1,
    taxonomyType: "POSITION",
    sortOrder: 5,
  },
  {
    id: "member",
    name: "中堅・若手",
    description: "一般社員、メンバー職",
    parentId: null,
    level: 1,
    taxonomyType: "POSITION",
    sortOrder: 6,
  },

  // =====================
  // 状況（フラット構造）
  // =====================
  {
    id: "large-enterprise",
    name: "大手",
    description: "大企業、上場企業クラス",
    parentId: null,
    level: 1,
    taxonomyType: "SITUATION",
    sortOrder: 1,
  },
  {
    id: "mid-size-company",
    name: "中堅",
    description: "中堅企業",
    parentId: null,
    level: 1,
    taxonomyType: "SITUATION",
    sortOrder: 2,
  },
  {
    id: "venture",
    name: "ベンチャー",
    description: "ベンチャー企業",
    parentId: null,
    level: 1,
    taxonomyType: "SITUATION",
    sortOrder: 3,
  },
  {
    id: "startup",
    name: "スタートアップ",
    description: "スタートアップ、シード期企業",
    parentId: null,
    level: 1,
    taxonomyType: "SITUATION",
    sortOrder: 4,
  },
  {
    id: "consulting-env",
    name: "コンサルティング環境",
    description: "コンサルティングファーム",
    parentId: null,
    level: 1,
    taxonomyType: "SITUATION",
    sortOrder: 5,
  },

  // =====================
  // スキル・メソッド（フラット構造）
  // =====================
  {
    id: "sales-skill",
    name: "営業",
    description: "営業スキル、セールス手法",
    parentId: null,
    level: 1,
    taxonomyType: "SKILL_KNOWLEDGE",
    sortOrder: 1,
  },
  {
    id: "logical-thinking",
    name: "ロジカルシンキング",
    description: "論理的思考、構造化思考",
    parentId: null,
    level: 1,
    taxonomyType: "SKILL_KNOWLEDGE",
    sortOrder: 2,
  },
  {
    id: "project-management",
    name: "プロジェクトマネジメント",
    description: "プロジェクト管理、進行管理",
    parentId: null,
    level: 1,
    taxonomyType: "SKILL_KNOWLEDGE",
    sortOrder: 3,
  },
  {
    id: "data-analysis",
    name: "データ分析",
    description: "データ分析、数値管理",
    parentId: null,
    level: 1,
    taxonomyType: "SKILL_KNOWLEDGE",
    sortOrder: 4,
  },
  {
    id: "communication",
    name: "コミュニケーション",
    description: "対人スキル、調整力",
    parentId: null,
    level: 1,
    taxonomyType: "SKILL_KNOWLEDGE",
    sortOrder: 5,
  },
];
