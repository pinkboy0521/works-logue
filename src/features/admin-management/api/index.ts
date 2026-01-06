import { prisma } from "@/shared/lib/prisma";
import type { Skill, Occupation } from "@prisma/client";

// スキル管理
export async function createSkill(data: {
  name: string;
  description?: string;
  categoryId: string;
}): Promise<{ success: boolean; error?: string; skill?: Skill }> {
  try {
    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        description: data.description,
        category: {
          connect: { id: data.categoryId },
        },
      },
    });
    return { success: true, skill };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return { success: false, error: "このスキル名は既に存在します" };
    }
    return { success: false, error: "スキルの作成に失敗しました" };
  }
}

export async function updateSkill(
  id: string,
  data: {
    name: string;
    description?: string;
    categoryId: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: {
          connect: { id: data.categoryId },
        },
      },
    });
    return { success: true };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return { success: false, error: "このスキル名は既に存在します" };
    }
    return { success: false, error: "スキルの更新に失敗しました" };
  }
}

export async function deleteSkill(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 使用中のスキルは削除不可
    const userSkillCount = await prisma.userSkill.count({
      where: { skillId: id },
    });

    if (userSkillCount > 0) {
      return {
        success: false,
        error: `このスキルは${userSkillCount}人のユーザーが使用中のため削除できません`,
      };
    }

    await prisma.skill.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: "スキルの削除に失敗しました" };
  }
}

// 職業管理
export async function createOccupation(data: {
  name: string;
  description?: string;
  categoryId: string;
}): Promise<{ success: boolean; error?: string; occupation?: Occupation }> {
  try {
    const occupation = await prisma.occupation.create({
      data: {
        name: data.name,
        description: data.description,
        category: {
          connect: { id: data.categoryId },
        },
      },
    });
    return { success: true, occupation };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return { success: false, error: "この職業名は既に存在します" };
    }
    return { success: false, error: "職業の作成に失敗しました" };
  }
}

export async function updateOccupation(
  id: string,
  data: {
    name: string;
    description?: string;
    categoryId: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.occupation.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: {
          connect: { id: data.categoryId },
        },
      },
    });
    return { success: true };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return { success: false, error: "この職業名は既に存在します" };
    }
    return { success: false, error: "職業の更新に失敗しました" };
  }
}

export async function deleteOccupation(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 使用中の職業は削除不可
    const userOccupationCount = await prisma.userOccupation.count({
      where: { occupationId: id },
    });

    if (userOccupationCount > 0) {
      return {
        success: false,
        error: `この職業は${userOccupationCount}人のユーザーが使用中のため削除できません`,
      };
    }

    await prisma.occupation.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: "職業の削除に失敗しました" };
  }
}

// 管理者権限チェック
export async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}
