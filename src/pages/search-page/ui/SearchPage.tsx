"use client";

import { ArticleSearchResult, Topic } from "@/entities";
import { ArticleList, TagSidebar } from "@/widgets";
import { Alert, AlertDescription, type TagNode, Button } from "@/shared";
import { AlertTriangle, Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

interface SearchPageProps {
  searchResult: ArticleSearchResult;
  tagGroups?: { tags: TagNode[] };
  allTopics?: Topic[];
  selectedTopicId?: string;
  error?: string;
}

export function SearchPage({
  searchResult,
  tagGroups = { tags: [] },
  allTopics = [],
  selectedTopicId,
  error,
}: SearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const { articles, searchInfo } = searchResult;
  const { totalFound, query } = searchInfo;

  // タグデータを取得
  const tags = tagGroups.tags || [];

  // トピック選択ハンドラー
  const handleTopicChange = (topicId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (topicId && topicId !== "all") {
        params.set("topic", topicId);
      } else {
        params.delete("topic");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div>
      {/* 記事数表示バー（スティッキー） */}      
      <div className="sticky z-40 border-b shadow-sm top-16 bg-background">
        <div className="container mx-auto px-12">          
            {/* 検索クエリ表示 */}            
            
              <div className="flex items-centertext-sm text-muted-foreground">                
                <span>{totalFound} 件の記事が見つかりました。</span>
                {query && (
                  <span>
                    （ 検索ワード：
                    <span className="font-semibold text-foreground">
                      &ldquo;{query}&rdquo;
                    </span>
                    {" "}）
                  </span>
                )}
              </div>
            
          </div>        
      </div>

      {/* トピック選択バー */}
      <div className="border-b shadow-sm py-2">
        <div className="container mx-auto px-8">
          <div
            className="px-4 rounded-lg my-2"
            style={{ height: "32px", display: "flex", alignItems: "center" }}
          >
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm font-semibold text-foreground">
                トピック:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={!selectedTopicId ? "default" : "outline"}
                size="sm"
                onClick={() => handleTopicChange("all")}
              >
                全て
              </Button>
              {allTopics.map((topic) => (
                <Button
                  key={topic.id}
                  variant={selectedTopicId === topic.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTopicChange(topic.id)}
                >
                  {topic.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* メインコンテンツ: 2カラムレイアウト */}
        <div className="flex gap-8">
          {/* 左サイドバー: タグフィルタ */}
          {tags.length > 0 && (
            <div className="hidden lg:block flex-shrink-0">
              <div className="sticky top-4">
                <TagSidebar
                  tags={tags}
                />
              </div>
            </div>
          )}

          {/* 右メインエリア: 記事一覧 */}
          <div className="flex-1 min-w-0">
            {articles.length > 0 ? (
              <ArticleList articles={articles} />
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  記事が見つかりませんでした
                </h3>
                <p className="text-muted-foreground mb-4">
                  {query
                    ? `「${query}」に一致する記事はありません。`
                    : "条件に一致する記事がありません。"}
                </p>
                <p className="text-sm text-muted-foreground">
                  • 検索キーワードを変更してみてください
                  <br />
                  • より一般的な用語を使用してみてください
                  <br />• フィルタ条件を緩くしてみてください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
