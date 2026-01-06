import { prisma } from "@/shared/lib/prisma";
import type { Occupation, OccupationCategory } from "@prisma/client";

export interface OccupationWithCategory extends Occupation {
  category: OccupationCategory;
}

/**
 * 全職業を取得（カテゴリ付き）
 */
export async function getAllOccupations(): Promise<
  Record<string, OccupationWithCategory[]>
> {
  const occupations = await prisma.occupation.findMany({
    include: {
      category: true,
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  // カテゴリ別にグループ化
  return occupations.reduce(
    (acc, occupation) => {
      const categoryKey = occupation.category.key;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(occupation);
      return acc;
    },
    {} as Record<string, OccupationWithCategory[]>,
  );
}

/**
 * 職業をIDで取得
 */
export async function getOccupationsByIds(
  occupationIds: string[],
): Promise<Occupation[]> {
  if (occupationIds.length === 0) return [];

  return await prisma.occupation.findMany({
    where: {
      id: {
        in: occupationIds,
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * 職業検索
 */
export async function searchOccupations(query: string): Promise<Occupation[]> {
  return await prisma.occupation.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: { name: "asc" },
    take: 20,
  });
}
