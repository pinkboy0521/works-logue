import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleById } from "@/shared/lib/actions/articles";
import { ArticleDetail } from "./ui";

interface PageProps {
  params: Promise<{
    userId: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await getArticleById(id);

    if (!article) {
      return {
        title: "記事が見つかりません",
      };
    }

    return {
      title: article.title,
      description:
        article.content?.substring(0, 160).replace(/\n/g, " ") ||
        "記事の詳細をご覧ください。",
      openGraph: {
        title: article.title,
        description:
          article.content?.substring(0, 160).replace(/\n/g, " ") ||
          "記事の詳細をご覧ください。",
        images: article.topImageUrl ? [article.topImageUrl] : [],
      },
    };
  } catch {
    return {
      title: "記事が見つかりません",
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const article = await getArticleById(id);

    if (!article) {
      notFound();
    }

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ArticleDetail article={article} />
      </div>
    );
  } catch (error) {
    console.error("記事の取得に失敗しました:", error);
    notFound();
  }
}
