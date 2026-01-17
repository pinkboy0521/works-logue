"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/shared";
import { deleteCommentSchema } from "../lib/validation";

// Admin permission check - will be imported from admin features later
async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("ログインが必要です。");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("管理者権限が必要です。");
  }

  return session.user.id;
}

interface DeleteCommentResult {
  success: boolean;
  error?: string;
}

/**
 * Soft delete a comment (Admin only) - Server Action
 */
export async function deleteComment(
  commentId: string,
): Promise<DeleteCommentResult> {
  try {
    const adminUserId = await requireAdmin();

    // Validate input
    const validatedData = deleteCommentSchema.parse({ commentId });

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: validatedData.commentId },
      include: {
        article: {
          select: { id: true },
        },
      },
    });

    if (!comment) {
      return {
        success: false,
        error: "コメントが見つかりません。",
      };
    }

    if (comment.isDeleted) {
      return {
        success: false,
        error: "このコメントはすでに削除されています。",
      };
    }

    // Soft delete the comment
    await prisma.comment.update({
      where: { id: validatedData.commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: adminUserId,
      },
    });

    // Revalidate the article page
    revalidatePath(`/articles/${comment.article.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete comment:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "入力内容が無効です。",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "コメントの削除に失敗しました。",
    };
  }
}
