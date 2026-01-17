import { ArticleStatus } from "@prisma/client";
import { type CustomPartialBlock } from "../../src/entities/article/model/types.js";

export type SeedArticleData = {
  id: string;
  title: string;
  userId: string;
  topicId: string;
  topImageUrl: string;
  content: CustomPartialBlock[];
  tags: {
    create: {
      tagId: string;
    }[];
  };
  status: ArticleStatus;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
};
