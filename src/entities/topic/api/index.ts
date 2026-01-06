import { prisma } from "@/shared";
import { TopicWithCount, TagWithCount } from "@/entities";

/**
 * すべてのトピックを記事数と共に取得
 */
export async function getTopicsWithCount(): Promise<TopicWithCount[]> {
  const topics = await prisma.topic.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: {
              status: "PUBLISHED",
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description,
    articleCount: topic._count.articles,
  }));
}

/**
 * 人気のトピック一覧を取得（記事数順）
 */
export async function getPopularTopics(
  limit: number = 10,
): Promise<TopicWithCount[]> {
  const topics = await getTopicsWithCount();
  return topics.sort((a, b) => b.articleCount - a.articleCount).slice(0, limit);
}

/**
 * すべてのタグを記事数と共に取得
 */
export async function getTagsWithCount(): Promise<TagWithCount[]> {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    description: tag.description,
    articleCount: tag._count.articles,
  }));
}

/**
 * 人気のタグ一覧を取得（記事数順）
 */
export async function getPopularTags(
  limit: number = 20,
): Promise<TagWithCount[]> {
  const tags = await getTagsWithCount();
  return tags.sort((a, b) => b.articleCount - a.articleCount).slice(0, limit);
}

/**
 * トピックIDで取得
 */
export async function getTopicById(id: string) {
  return await prisma.topic.findUnique({
    where: { id },
    include: {
      articles: {
        where: {
          status: "PUBLISHED",
        },
        orderBy: {
          publishedAt: "desc",
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
      },
    },
  });
}

/**
 * タグIDで取得
 */
export async function getTagById(id: string) {
  return await prisma.tag.findUnique({
    where: { id },
    include: {
      articles: {
        where: {
          article: {
            status: "PUBLISHED",
          },
        },
        include: {
          article: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  image: true,
                },
              },
              topic: true,
            },
          },
        },
        orderBy: {
          article: {
            publishedAt: "desc",
          },
        },
      },
    },
  });
}

/**
 * すべてのトピックを取得（選択用）
 */
export async function getAllTopics() {
  const topics = await prisma.topic.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return topics;
}
