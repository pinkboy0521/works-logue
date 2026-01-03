import { Topic as PrismaTopic, Tag as PrismaTag } from "@prisma/client";

// ベースのトピックタイプ
export type Topic = PrismaTopic;

// ベースのタグタイプ
export type Tag = PrismaTag;

// 記事数付きのトピック
export type TopicWithCount = Topic & {
  articleCount: number;
};

// 記事数付きのタグ
export type TagWithCount = Tag & {
  articleCount: number;
};
