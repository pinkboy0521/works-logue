import { prisma } from "@/shared";
import type { ArticleLikeWithRelations } from "./model";

/**
 * 記事のいいね数を取得
 */
export async function getArticleLikeCount(articleId: string): Promise<number> {
  return await prisma.articleLike.count({
    where: { articleId },
  });
}

/**
 * ユーザーが記事をいいねしているかチェック
 */
export async function isArticleLikedByUser(
  articleId: string,
  userId: string,
): Promise<boolean> {
  const like = await prisma.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
  return !!like;
}

/**
 * 記事にいいねを追加
 */
export async function createArticleLike(
  articleId: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // いいねを作成
    await tx.articleLike.create({
      data: {
        articleId,
        userId,
      },
    });

    // 記事のいいね数を更新
    await tx.article.update({
      where: { id: articleId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });
  });
}

/**
 * 記事のいいねを削除
 */
export async function deleteArticleLike(
  articleId: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // いいねを削除
    await tx.articleLike.delete({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    // 記事のいいね数を更新
    await tx.article.update({
      where: { id: articleId },
      data: {
        likeCount: {
          decrement: 1,
        },
      },
    });
  });
}

/**
 * ユーザーがいいねした記事一覧を取得
 */
export async function getUserArticleLikes(
  userId: string,
  page = 1,
  limit = 10,
): Promise<ArticleLikeWithRelations[]> {
  const offset = (page - 1) * limit;

  return await prisma.articleLike.findMany({
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
 * ユーザーがいいねした記事数を取得
 */
export async function getUserArticleLikeCount(userId: string): Promise<number> {
  return await prisma.articleLike.count({
    where: { userId },
  });
}
