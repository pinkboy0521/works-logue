import { ArticleDetail } from "@/widgets";
import {
  getArticleById,
  incrementArticleViews,
  getRelatedArticles,
  calculateArticleMeta,
} from "@/entities";
import { notFound } from "next/navigation";

interface ArticleDetailPageProps {
  params: {
    id: string;
    userId: string;
  };
}

export async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getArticleById(params.id);

  if (!article) {
    notFound();
  }

  // 記事詳細ページ特有のロジック
  const [relatedArticles, meta] = await Promise.all([
    getRelatedArticles(article.id, article.topicId, 3),
    Promise.resolve(calculateArticleMeta(article.content || "")),
  ]);

  // 閲覧数を非同期で増加（エラーでもページ表示は継続）
  incrementArticleViews(article.id).catch(console.error);

  return (
    <ArticleDetail
      article={article}
      relatedArticles={relatedArticles}
      meta={meta}
    />
  );
}
