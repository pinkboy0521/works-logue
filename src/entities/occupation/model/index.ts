import type { Occupation, OccupationCategory } from "@prisma/client";

export type { Occupation, OccupationCategory };

export interface OccupationWithCategory extends Occupation {
  category: OccupationCategory;
}

/**
 * カテゴリ名を表示名に変換
 */
export function getOccupationCategoryLabel(
  category: OccupationCategory,
): string {
  return category.name;
}

/**
 * カテゴリキーから表示名を取得
 */
export function getOccupationCategoryLabelByKey(categoryKey: string): string {
  const categoryMap: Record<string, string> = {
    engineering: "エンジニアリング",
    design: "デザイン",
    business: "ビジネス・企画",
    marketing: "マーケティング・PR",
    other: "その他",
  };
  return categoryMap[categoryKey] || categoryKey;
}

/**
 * 職業選択状態の管理
 */
export interface OccupationSelection {
  selectedIds: string[];
  occupations: Occupation[];
}

export function createOccupationSelection(
  occupations: Occupation[] = [],
): OccupationSelection {
  return {
    selectedIds: occupations.map((o) => o.id),
    occupations,
  };
}

export function toggleOccupationSelection(
  selection: OccupationSelection,
  occupation: Occupation,
): OccupationSelection {
  const isSelected = selection.selectedIds.includes(occupation.id);

  if (isSelected) {
    return {
      selectedIds: selection.selectedIds.filter((id) => id !== occupation.id),
      occupations: selection.occupations.filter((o) => o.id !== occupation.id),
    };
  } else {
    return {
      selectedIds: [...selection.selectedIds, occupation.id],
      occupations: [...selection.occupations, occupation],
    };
  }
}
