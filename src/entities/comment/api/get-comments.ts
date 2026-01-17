import { prisma } from "@/shared";
import type { CommentWithReplies } from "../model/types";

/**
 * Get all comments for an article with nested structure
 */
export async function getCommentsByArticleId(
  articleId: string,
): Promise<CommentWithReplies[]> {
  const comments = await prisma.comment.findMany({
    where: {
      articleId,
      OR: [
        { isDeleted: false },
        // Include deleted comments if they have replies (to maintain thread structure)
        {
          isDeleted: true,
          replies: {
            some: {
              isDeleted: false,
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          userId: true,
          image: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              userId: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  userId: true,
                  image: true,
                },
              },
              // 3 levels deep maximum
              replies: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments as CommentWithReplies[];
}

/**
 * Get comment count for an article
 */
export async function getCommentCount(articleId: string): Promise<number> {
  return await prisma.comment.count({
    where: {
      articleId,
      isDeleted: false,
    },
  });
}
