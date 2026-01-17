"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/shared";
import { createCommentSchema } from "../lib/validation";
import type { CreateCommentData } from "../model/types";

interface CreateCommentResult {
  success: boolean;
  error?: string;
  commentId?: string;
}

/**
 * Create a new comment - Server Action
 */
export async function createComment(
  data: CreateCommentData,
): Promise<CreateCommentResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "ログインが必要です。",
      };
    }

    // Validate input
    const validatedData = createCommentSchema.parse(data);

    // Check if article exists and is published
    const article = await prisma.article.findFirst({
      where: {
        id: validatedData.articleId,
        status: "PUBLISHED",
      },
      select: { id: true },
    });

    if (!article) {
      return {
        success: false,
        error: "記事が見つかりません。",
      };
    }

    // If parent comment exists, validate it
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: validatedData.parentId,
          articleId: validatedData.articleId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!parentComment) {
        return {
          success: false,
          error: "返信先のコメントが見つかりません。",
        };
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        articleId: validatedData.articleId,
        userId: session.user.id,
        parentId: validatedData.parentId,
      },
    });

    // Revalidate the article page to show new comment
    revalidatePath(`/articles/${validatedData.articleId}`);

    return {
      success: true,
      commentId: comment.id,
    };
  } catch (error) {
    console.error("Failed to create comment:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "入力内容が無効です。",
      };
    }

    return {
      success: false,
      error:
        "コメントの投稿に失敗しました。しばらくしてから再度お試しください。",
    };
  }
}
