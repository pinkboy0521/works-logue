"use server";

import { prisma } from "@/shared";
import { Block } from "@blocknote/core";
import {
  ArticleWithDetails,
  RelatedArticle,
  DraftArticle,
  PublishedArticleListItem,
} from "@/entities";

// BlockNoteコンテンツ型
type ArticleContent = Block[];

/**
 * BlockNoteコンテンツをPrismaで保存可能な形式に変換
 * - tableのcolumnWidthsのundefinedをnullに変換
 * - その他のundefined値をクリーンアップ
 */
function cleanBlockNoteContent(content: unknown): unknown {
  if (Array.isArray(content)) {
    return content.map(cleanBlockNoteContent);
  }

  if (typeof content === "object" && content !== null) {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(content)) {
      if (value === undefined) {
        continue; // undefined値をスキップ
      }

      if (key === "columnWidths" && Array.isArray(value)) {
        // columnWidths配列のundefinedをnullに変換
        cleaned[key] = value.map((width) =>
          width === undefined ? null : width,
        );
      } else {
        cleaned[key] = cleanBlockNoteContent(value);
      }
    }

    return cleaned;
  }

  return content;
}

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
  topicId: string | null,
  limit: number = 3,
): Promise<RelatedArticle[]> {
  try {
    // topicIdがnullの場合は関連記事なし
    if (!topicId) {
      return [];
    }

    const relatedArticles = await prisma.article.findMany({
      where: {
        id: { not: articleId },
        status: "PUBLISHED",
        topicId: { not: null }, // topicIdが存在する記事のみ
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
      select: {
        id: true,
        title: true,
        topImageUrl: true,
        publishedAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
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

    return relatedArticles as RelatedArticle[];
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
        topicId: { not: null }, // topicIdが存在する記事のみ
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
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

    return articles.map((article) => ({
      ...article,
      content: article.content as ArticleContent,
    })) as PublishedArticleListItem[]; // topicIdフィルター済みなので型安全
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
        topicId: { not: null }, // topicIdが存在する記事のみ
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
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

    return articles.map((article) => ({
      ...article,
      content: article.content as ArticleContent,
    })) as PublishedArticleListItem[]; // topicIdフィルター済みなので型安全
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
        topicId: { not: null }, // topicIdが存在する記事のみ
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
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

    return articles.map((article) => ({
      ...article,
      content: article.content as ArticleContent,
    })) as PublishedArticleListItem[];
  } catch (error) {
    console.error("Error fetching popular articles:", error);
    throw new Error("人気記事の取得に失敗しました");
  }
}

export async function getArticleById(
  id: string,
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
            displayName: true,
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

    return article
      ? {
          ...article,
          content: article.content as ArticleContent,
        }
      : null;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("記事の取得に失敗しました");
  }
}

/**
 * 編集用：記事を取得（下書き・非公開含む）- ユーザー認証付き
 */
export async function getArticleForEdit(
  id: string,
  userId: string,
): Promise<DraftArticle | null> {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id,
        userId, // 自分の記事のみ編集可能
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
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
                description: true,
              },
            },
          },
        },
      },
    });

    return article
      ? {
          ...article,
          content: article.content as ArticleContent,
        }
      : null;
  } catch (error) {
    console.error("Error fetching article for edit:", error);
    throw new Error("編集用記事の取得に失敗しました");
  }
}

/**
 * 記事を更新
 */
export async function updateArticle(
  id: string,
  userId: string,
  data: {
    title?: string;
    content?: ArticleContent; // BlockNote JSON のみ
    topImageUrl?: string;
    topicId?: string;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE";
    tagIds?: string[];
  },
) {
  try {
    // 記事の所有者確認
    const existingArticle = await prisma.article.findUnique({
      where: { id, userId },
    });

    if (!existingArticle) {
      throw new Error("記事が見つからないか、編集権限がありません");
    }

    // タグの関連データを準備
    const tagConnections = data.tagIds
      ? {
          deleteMany: {} as object,
          create: data.tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        }
      : undefined;

    // 更新データをPrismaの型に適合させて構築
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) {
      // BlockNoteコンテンツをクリーンアップして保存
      updateData.content = cleanBlockNoteContent(data.content);
    }
    if (data.topImageUrl !== undefined)
      updateData.topImageUrl = data.topImageUrl;
    if (data.topicId !== undefined) {
      updateData.topic = {
        connect: { id: data.topicId },
      };
    }
    if (data.status !== undefined) updateData.status = data.status;

    // 公開日時設定
    if (data.status === "PUBLISHED" && !existingArticle.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // タグ設定
    if (tagConnections) {
      updateData.tags = tagConnections;
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
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
                description: true,
              },
            },
          },
        },
      },
    });

    return updatedArticle;
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("記事の更新に失敗しました");
  }
}

/**
 * 新しい記事を作成（下書き状態）
 */
export async function createDraftArticle(userId: string) {
  try {
    const article = await prisma.article.create({
      data: {
        userId,
        title: "",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "", styles: {} }],
          },
        ],
        status: "DRAFT",
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            image: true,
          },
        },
        topic: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return article;
  } catch (error) {
    console.error("Error creating draft article:", error);
    throw new Error("下書き記事の作成に失敗しました");
  }
}

/**
 * 記事を削除
 */
export async function deleteArticle(id: string, userId: string) {
  try {
    // 記事の所有者確認
    const existingArticle = await prisma.article.findUnique({
      where: { id, userId },
    });

    if (!existingArticle) {
      throw new Error("記事が見つからないか、削除権限がありません");
    }

    await prisma.article.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    throw new Error("記事の削除に失敗しました");
  }
}
