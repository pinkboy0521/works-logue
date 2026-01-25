import { ArticleList } from "@/widgets";
import { getLatestArticles, getPopularArticles } from "@/entities";
import { enrichArticlesWithReactions } from "@/features";
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
    console.error("Failed to fetch data:", error);
    // データベース接続エラーの場合、空の配列でフォールバック
    latestArticles = [];
    popularArticles = [];
  }

  // リアクション情報を追加
  const [enrichedLatestArticles, enrichedPopularArticles] = await Promise.all([
    enrichArticlesWithReactions(latestArticles),
    enrichArticlesWithReactions(popularArticles),
  ]);

  return (    
  <div className="mx-auto w-full max-w-screen-2xl px-[clamp(16px,11vw,160px)] py-l">
      {/* 最新記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-2">最新記事</h2>
        </div>

        {enrichedLatestArticles.length > 0 ? (
          <ArticleList articles={enrichedLatestArticles} />
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

        {enrichedPopularArticles.length > 0 ? (
          <ArticleList articles={enrichedPopularArticles} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">人気記事がありません</p>
          </div>
        )}
      </section>
    </div>
  );
}
