import { prisma } from "@/shared/lib/prisma";
import type { Skill, SkillCategory } from "@prisma/client";

export interface SkillWithCategory extends Skill {
  category: SkillCategory;
}

/**
 * 全スキルを取得（カテゴリ付き）
 */
export async function getAllSkills(): Promise<
  Record<string, SkillWithCategory[]>
> {
  const skills = await prisma.skill.findMany({
    include: {
      category: true,
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  // カテゴリ別にグループ化
  return skills.reduce(
    (acc, skill) => {
      const categoryKey = skill.category.key;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(skill);
      return acc;
    },
    {} as Record<string, SkillWithCategory[]>,
  );
}

/**
 * スキルをIDで取得
 */
export async function getSkillsByIds(skillIds: string[]): Promise<Skill[]> {
  if (skillIds.length === 0) return [];

  return await prisma.skill.findMany({
    where: {
      id: {
        in: skillIds,
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * スキル検索
 */
export async function searchSkills(query: string): Promise<Skill[]> {
  return await prisma.skill.findMany({
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
