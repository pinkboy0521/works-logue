import { type Metadata } from "next";
import { getArticleById } from "@/entities";
import { ArticleDetailPage } from "@/pages";

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

    // コンテンツからプレーンテキストを抽出
    const getContentDescription = (content: unknown): string => {
      if (Array.isArray(content)) {
        // BlockNote JSON形式の場合
        const textBlocks = content
          .map((block: unknown) => {
            if (typeof block === "object" && block !== null) {
              const typedBlock = block as { content?: { text?: string }[] };
              if (typedBlock.content && Array.isArray(typedBlock.content)) {
                return typedBlock.content.map((c) => c.text || "").join("");
              }
            }
            return "";
          })
          .join(" ");
        return textBlocks.substring(0, 160).replace(/\n/g, " ");
      } else if (typeof content === "string") {
        // Markdown形式の場合（後方互換性）
        return content.substring(0, 160).replace(/\n/g, " ");
      }
      return "記事の詳細をご覧ください。";
    };

    const description = getContentDescription(article.content);

    return {
      title: article.title,
      description,
      openGraph: {
        title: article.title,
        description,
        images: article.topImageUrl ? [article.topImageUrl] : [],
      },
    };
  } catch {
    return {
      title: "記事が見つかりません",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { id, userId } = await params;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <ArticleDetailPage params={{ id, userId }} />
    </div>
  );
}
