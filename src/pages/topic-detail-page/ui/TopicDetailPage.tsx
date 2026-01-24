"use client";

import { Topic, ArticlesWithPagination } from "@/entities";
import { type ArticleWithReactions } from "@/features";
import { ArticleList, TagSidebar } from "@/widgets";
import { Badge, type TagNode } from "@/shared";
import { BookOpen, Users } from "lucide-react";

interface TopicDetailPageProps {
  topic: Topic;
  articlesData: ArticlesWithPagination & { articles: ArticleWithReactions[] };
  selectedTagIds?: string[];
  tagGroups?: Record<string, unknown[]>;
}

export function TopicDetailPage({
  topic,
  articlesData,
  selectedTagIds = [],
  tagGroups = {},
}: TopicDetailPageProps) {
  const { articles, pagination } = articlesData;

  // tagGroupsをTagNode型にキャスト
  const typedTagGroups = tagGroups as Record<string, TagNode[]>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* トピックヘッダー */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                {topic.name}
              </h1>
            </div>

            {topic.description && (
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {topic.description}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{pagination.total}件の記事</span>
              </div>
              {selectedTagIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span>フィルタ中:</span>
                  {selectedTagIds.map((tagId) => (
                    <Badge key={tagId} variant="secondary">
                      タグ{tagId}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ: 2カラムレイアウト */}
      <div className="flex gap-8">
        {/* 左サイドバー: タグフィルタ */}
        {Object.keys(typedTagGroups).length > 0 && (
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-4">
              <TagSidebar tags={Object.values(typedTagGroups).flat()} />
            </div>
          </div>
        )}

        {/* 右メインエリア: 記事一覧 */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              {selectedTagIds.length > 0
                ? "フィルタされた記事"
                : `${topic.name}の記事`}
            </h2>
            <p className="text-muted-foreground">
              {pagination.total}件中 {articles.length}件を表示
            </p>
          </div>

          {articles.length > 0 ? (
            <ArticleList articles={articles} />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                記事が見つかりませんでした
              </h3>
              <p className="text-muted-foreground">
                {selectedTagIds.length > 0
                  ? "選択されたフィルタに一致する記事がありません。"
                  : `${topic.name}の記事はまだ投稿されていません。`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
