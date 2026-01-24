import { prisma } from "@/shared/lib/prisma";
import type {
  ProfileSetupData,
  UserWithProfile,
} from "@/entities/user/model/types";

// Prismaエラー型定義
type PrismaError = {
  code: string;
  meta?: {
    target?: string[];
  };
};

function isPrismaError(error: unknown): error is PrismaError {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}

/**
 * プロフィール情報を更新（トランザクション）
 */
export async function updateUserProfile(
  userId: string,
  data: ProfileSetupData,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("updateUserProfile called with userId:", userId);

    // まずユーザーの存在を確認
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, image: true },
    });

    if (!existingUser) {
      console.error("User not found for userId:", userId);
      return {
        success: false,
        error: "ユーザーが見つかりません。セッションを再度確認してください。",
      };
    }

    console.log("User found, proceeding with update");

    await prisma.$transaction(async (tx) => {
      // 既存のプロフィール画像があれば削除
      if (
        data.imageUrl &&
        existingUser.image &&
        existingUser.image !== data.imageUrl
      ) {
        // 古い画像のpublic_idを抽出してログに記録（後でAPI Route経由で削除）
        try {
          const urlParts = existingUser.image.split("/");
          const publicIdWithExtension = urlParts.slice(-3).join("/");
          const publicId = publicIdWithExtension.split(".")[0];
          console.log("Old profile image to be cleaned up:", publicId);
        } catch (deleteError) {
          console.warn("Failed to extract old profile image ID:", deleteError);
        }
      }

      // ユーザー情報を更新
      const updateData: Record<string, string | null> = {};
      if (data.displayName !== undefined)
        updateData.displayName = data.displayName;
      if (data.userId !== undefined) updateData.userId = data.userId;
      if (data.bio !== undefined) updateData.bio = data.bio || null;
      if (data.website !== undefined) updateData.website = data.website || null;
      if (data.location !== undefined)
        updateData.location = data.location || null;
      if (data.statusMessage !== undefined)
        updateData.statusMessage = data.statusMessage || null;
      if (data.imageUrl !== undefined) updateData.image = data.imageUrl || null;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // 既存のスキル・職業関連を削除（画像のみ更新の場合はスキップ）
      if (data.skillIds !== undefined) {
        await tx.userSkill.deleteMany({
          where: { userId },
        });
      }
      if (data.occupationIds !== undefined) {
        await tx.userOccupation.deleteMany({
          where: { userId },
        });
      }

      // 新しいスキルを追加
      if (data.skillIds && data.skillIds.length > 0) {
        await tx.userSkill.createMany({
          data: data.skillIds.map((skillId) => ({
            userId,
            skillId,
          })),
        });
      }

      // 新しい職業を追加
      if (data.occupationIds && data.occupationIds.length > 0) {
        await tx.userOccupation.createMany({
          data: data.occupationIds.map((occupationId) => ({
            userId,
            occupationId,
          })),
        });
      }

      return updatedUser;
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Profile update error:", error);

    // Prismaエラーチェック
    if (isPrismaError(error) && error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("userId")) {
        return {
          success: false,
          error: "このユーザーIDは既に使用されています",
        };
      }
      if (target?.includes("email")) {
        return {
          success: false,
          error: "このメールアドレスは既に使用されています",
        };
      }
    }

    return {
      success: false,
      error: "プロフィール更新中にエラーが発生しました",
    };
  }
}

/**
 * ユーザープロフィール詳細を取得
 */
export async function getUserProfile(
  userId: string,
): Promise<UserWithProfile | null> {
  try {
    console.log("getUserProfile called with userId:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSkills: {
          include: {
            skill: true,
          },
          orderBy: {
            skill: {
              name: "asc",
            },
          },
        },
        userOccupations: {
          include: {
            occupation: true,
          },
          orderBy: {
            occupation: {
              name: "asc",
            },
          },
        },
      },
    });

    console.log(
      "Database query result:",
      user ? "User found" : "User not found",
    );    

    return user;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
}

/**
 * プロフィール完了度チェック
 */
export async function checkProfileCompletion(userId: string): Promise<{
  isCompleted: boolean;
  missingFields: string[];
  user?: Pick<UserWithProfile, "displayName" | "userId" | "emailVerified">;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      userId: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return { isCompleted: false, missingFields: ["user"] };
  }

  const missingFields: string[] = [];

  if (!user.displayName) missingFields.push("displayName");
  if (!user.userId) missingFields.push("userId");

  return {
    isCompleted: missingFields.length === 0,
    missingFields,
    user,
  };
}
