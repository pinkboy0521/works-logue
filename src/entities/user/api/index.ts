import { prisma } from "@/shared";
import { UserWithArticles, UserWithStats, UserPublicInfo } from "@/entities/user/model";

/**
 * IDでユーザーを取得
 */
export async function getUserById(id: string): Promise<UserPublicInfo | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * ユーザー詳細情報を記事と一緒に取得
 */
export async function getUserWithArticles(id: string): Promise<UserWithArticles | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      articles: {
        where: {
          status: 'PUBLISHED', // 公開済みの記事のみ
        },
        orderBy: {
          publishedAt: 'desc',
        },
        include: {
          topic: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  });

  return user;
}

/**
 * ユーザーの統計情報を取得
 */
export async function getUserStats(id: string): Promise<UserWithStats | null> {
  const user = await getUserById(id);
  if (!user) return null;

  const stats = await prisma.article.aggregate({
    where: {
      userId: id,
      status: 'PUBLISHED',
    },
    _count: {
      id: true,
    },
    _sum: {
      viewCount: true,
      likeCount: true,
    },
  });

  const totalArticles = await prisma.article.count({
    where: {
      userId: id,
    },
  });

  return {
    ...user,
    totalArticles,
    publishedArticles: stats._count.id || 0,
    totalViews: stats._sum.viewCount || 0,
    totalLikes: stats._sum.likeCount || 0,
  };
}

/**
 * 人気のユーザー一覧を取得（記事のいいね数順）
 */
export async function getPopularUsers(limit: number = 10): Promise<UserWithStats[]> {
  const users = await prisma.user.findMany({
    take: limit,
    include: {
      articles: {
        where: {
          status: 'PUBLISHED',
        },
      },
    },
  });

  // 統計情報を計算
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const stats = await getUserStats(user.id);
      return stats!;
    })
  );

  // いいね数でソート
  return usersWithStats.sort((a, b) => b.totalLikes - a.totalLikes);
}

/**
 * 最近活動したユーザー一覧を取得
 */
export async function getActiveUsers(limit: number = 10): Promise<UserPublicInfo[]> {
  const users = await prisma.user.findMany({
    take: limit,
    where: {
      articles: {
        some: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 過去30日
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return users;
}