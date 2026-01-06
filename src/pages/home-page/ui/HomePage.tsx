import { ArticleList } from "@/widgets";
import { getLatestArticles, getPopularArticles } from "@/entities";
import type { PublishedArticleListItem } from "@/entities";

export async function HomePage() {
  let latestArticles: PublishedArticleListItem[] = [];
  let popularArticles: PublishedArticleListItem[] = [];

  try {
    [latestArticles, popularArticles] = await Promise.all([
      getLatestArticles(3),
      getPopularArticles(6),
    ]);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    // データベース接続エラーの場合、空の配列でフォールバック
    latestArticles = [];
    popularArticles = [];
  }

  return (
    <div className="container mx-auto px-xxxl py-l">
      {/* 最新記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-2">最新記事</h2>
        </div>

        {latestArticles.length > 0 ? (
          <ArticleList articles={latestArticles} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">最新記事がありません</p>
          </div>
        )}
      </section>

      {/* 人気記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-2">人気記事</h2>
        </div>

        {popularArticles.length > 0 ? (
          <ArticleList articles={popularArticles} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">人気記事がありません</p>
          </div>
        )}
      </section>
    </div>
  );
}
