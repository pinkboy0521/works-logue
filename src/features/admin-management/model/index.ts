import { z } from "zod";

// スキルフォームのスキーマ
export const skillFormSchema = z.object({
  name: z
    .string()
    .min(1, "スキル名は必須です")
    .max(100, "スキル名は100文字以内で入力してください"),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .optional(),
  categoryId: z.string().min(1, "カテゴリは必須です"),
});

// 職業フォームのスキーマ
export const occupationFormSchema = z.object({
  name: z
    .string()
    .min(1, "職業名は必須です")
    .max(100, "職業名は100文字以内で入力してください"),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .optional(),
  categoryId: z.string().min(1, "カテゴリは必須です"),
});

export type SkillFormData = z.infer<typeof skillFormSchema>;
export type OccupationFormData = z.infer<typeof occupationFormSchema>;

// カテゴリ選択肢
export const SKILL_CATEGORY_OPTIONS = [
  { value: "programming", label: "プログラミング言語" },
  { value: "framework", label: "フレームワーク・ライブラリ" },
  { value: "design", label: "デザイン・UI/UX" },
  { value: "marketing", label: "マーケティング" },
  { value: "business", label: "ビジネス・マネジメント" },
];

export const OCCUPATION_CATEGORY_OPTIONS = [
  { value: "engineering", label: "エンジニアリング" },
  { value: "design", label: "デザイン" },
  { value: "business", label: "ビジネス・企画" },
  { value: "marketing", label: "マーケティング・営業" },
  { value: "management", label: "マネジメント" },
  { value: "hr", label: "人事・組織" },
  { value: "data", label: "データ・分析" },
  { value: "security", label: "セキュリティ" },
  { value: "quality", label: "品質保証" },
];
