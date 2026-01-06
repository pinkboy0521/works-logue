import type { Skill, SkillCategory } from "@prisma/client";

export type { Skill, SkillCategory };

export interface SkillWithCategory extends Skill {
  category: SkillCategory;
}

/**
 * カテゴリ名を表示名に変換
 */
export function getCategoryLabel(category: SkillCategory): string {
  return category.name;
}

/**
 * カテゴリキーから表示名を取得
 */
export function getCategoryLabelByKey(categoryKey: string): string {
  const categoryMap: Record<string, string> = {
    programming: "プログラミング言語",
    framework: "フレームワーク",
    design: "デザイン・UI/UX",
    marketing: "マーケティング",
    business: "ビジネス・マネジメント",
  };
  return categoryMap[categoryKey] || categoryKey;
}

/**
 * スキル選択状態の管理
 */
export interface SkillSelection {
  selectedIds: string[];
  skills: Skill[];
}

export function createSkillSelection(skills: Skill[] = []): SkillSelection {
  return {
    selectedIds: skills.map((s) => s.id),
    skills,
  };
}

export function toggleSkillSelection(
  selection: SkillSelection,
  skill: Skill,
): SkillSelection {
  const isSelected = selection.selectedIds.includes(skill.id);

  if (isSelected) {
    return {
      selectedIds: selection.selectedIds.filter((id) => id !== skill.id),
      skills: selection.skills.filter((s) => s.id !== skill.id),
    };
  } else {
    return {
      selectedIds: [...selection.selectedIds, skill.id],
      skills: [...selection.skills, skill],
    };
  }
}
