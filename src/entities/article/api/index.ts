"use server";

import { prisma } from "@/shared";
import { ArticleWithDetails, RelatedArticle } from "@/entities";

/**
 * 記事の閲覧数を増加
 */
export async function incrementArticleViews(id: string): Promise<void> {
  try {
    await prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing article views:", error);
    // 閲覧数の増加に失敗してもページ表示は継続
  }
}

/**
 * 関連記事を取得（同じトピック・タグの記事）
 */
export async function getRelatedArticles(
  articleId: string,
  topicId: string,
  limit: number = 3
): Promise<RelatedArticle[]> {
  try {
    const relatedArticles = await prisma.article.findMany({
      where: {
        AND: [
          { id: { not: articleId } },
          { status: "PUBLISHED" },
          {
            OR: [
              { topicId },
              {
                tags: {
                  some: {
                    tag: {
                      articles: {
                        some: {
                          articleId,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        topImageUrl: true,
        publishedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ likeCount: "desc" }, { viewCount: "desc" }],
      take: limit,
    });

    return relatedArticles;
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

export async function getPublishedArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 20, // 最新20件を取得
    });

    return articles;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw new Error("記事の取得に失敗しました");
  }
}

export async function getLatestArticles(limit: number = 3) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return articles;
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    throw new Error("最新記事の取得に失敗しました");
  }
}

export async function getPopularArticles(limit: number = 3) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        viewCount: "desc",
      },
      take: limit,
    });

    return articles;
  } catch (error) {
    console.error("Error fetching popular articles:", error);
    throw new Error("人気記事の取得に失敗しました");
  }
}

export async function getArticleById(
  id: string
): Promise<ArticleWithDetails | null> {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id,
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("記事の取得に失敗しました");
  }
}
