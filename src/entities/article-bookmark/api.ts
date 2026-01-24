import { prisma } from "@/shared";
import type { ArticleBookmarkWithRelations } from "./model";

/**
 * 記事のブックマーク数を取得
 */
export async function getArticleBookmarkCount(
  articleId: string,
): Promise<number> {
  return await prisma.articleBookmark.count({
    where: { articleId },
  });
}

/**
 * ユーザーが記事をブックマークしているかチェック
 */
export async function isArticleBookmarkedByUser(
  articleId: string,
  userId: string,
): Promise<boolean> {
  const bookmark = await prisma.articleBookmark.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
  return !!bookmark;
}

/**
 * 記事にブックマークを追加
 */
export async function createArticleBookmark(
  articleId: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // ブックマークを作成
    await tx.articleBookmark.create({
      data: {
        articleId,
        userId,
      },
    });

    // 記事のブックマーク数を更新
    await tx.article.update({
      where: { id: articleId },
      data: {
        bookmarkCount: {
          increment: 1,
        },
      },
    });
  });
}

/**
 * 記事のブックマークを削除
 */
export async function deleteArticleBookmark(
  articleId: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // ブックマークを削除
    await tx.articleBookmark.delete({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    // 記事のブックマーク数を更新
    await tx.article.update({
      where: { id: articleId },
      data: {
        bookmarkCount: {
          decrement: 1,
        },
      },
    });
  });
}

/**
 * ユーザーがブックマークした記事一覧を取得
 */
export async function getUserArticleBookmarks(
  userId: string,
  page = 1,
  limit = 10,
): Promise<ArticleBookmarkWithRelations[]> {
  const offset = (page - 1) * limit;

  return await prisma.articleBookmark.findMany({
    where: { userId },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          topImageUrl: true,
          createdAt: true,
          user: {
            select: {
              displayName: true,
              userId: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  });
}

/**
 * ユーザーがブックマークした記事数を取得
 */
export async function getUserArticleBookmarkCount(
  userId: string,
): Promise<number> {
  return await prisma.articleBookmark.count({
    where: { userId },
  });
}
