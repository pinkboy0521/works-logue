'use server';

import { prisma } from '../prisma';

export async function getPublishedArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 20 // 最新20件を取得
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw new Error('記事の取得に失敗しました');
  }
}

export async function getLatestArticles(limit: number = 3) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });

    return articles;
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    throw new Error('最新記事の取得に失敗しました');
  }
}

export async function getPopularArticles(limit: number = 3) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: limit
    });

    return articles;
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    throw new Error('人気記事の取得に失敗しました');
  }
}

export async function getArticleById(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id,
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw new Error('記事の取得に失敗しました');
  }
}