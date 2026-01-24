"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  createArticleLike,
  deleteArticleLike,
  createArticleBookmark,
  deleteArticleBookmark,
  isArticleLikedByUser,
  isArticleBookmarkedByUser,
} from "@/entities";

/**
 * いいねをトグル（追加または削除）
 */
export async function toggleArticleLike(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "ログインが必要です",
        requiresAuth: true,
      };
    }

    const articleId = formData.get("articleId") as string;

    // 現在のいいね状態をチェック
    const isCurrentlyLiked = await isArticleLikedByUser(
      articleId,
      session.user.id,
    );

    if (isCurrentlyLiked) {
      // いいねを削除
      await deleteArticleLike(articleId, session.user.id);
    } else {
      // いいねを追加
      await createArticleLike(articleId, session.user.id);
    }

    // キャッシュを無効化
    revalidatePath("/");
    revalidatePath(`/articles/${articleId}`);

    return {
      success: true,
      isLiked: !isCurrentlyLiked,
      message: isCurrentlyLiked ? "いいねを取り消しました" : "いいねしました",
    };
  } catch (error) {
    console.error("Toggle like error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "いいねの操作に失敗しました",
    };
  }
}

/**
 * ブックマークをトグル（追加または削除）
 */
export async function toggleArticleBookmark(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "ログインが必要です",
        requiresAuth: true,
      };
    }

    const articleId = formData.get("articleId") as string;

    // 現在のブックマーク状態をチェック
    const isCurrentlyBookmarked = await isArticleBookmarkedByUser(
      articleId,
      session.user.id,
    );

    if (isCurrentlyBookmarked) {
      // ブックマークを削除
      await deleteArticleBookmark(articleId, session.user.id);
    } else {
      // ブックマークを追加
      await createArticleBookmark(articleId, session.user.id);
    }

    // キャッシュを無効化
    revalidatePath("/");
    revalidatePath(`/articles/${articleId}`);

    return {
      success: true,
      isBookmarked: !isCurrentlyBookmarked,
      message: isCurrentlyBookmarked
        ? "ブックマークを取り消しました"
        : "ブックマークに保存しました",
    };
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "ブックマークの操作に失敗しました",
    };
  }
}
