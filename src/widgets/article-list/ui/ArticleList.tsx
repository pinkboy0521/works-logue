import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared";
import { ArticleContent, AuthorCard } from "@/entities";

type ArticleWithRelations = {
  id: string;
  title: string;
  content: ArticleContent; // BlockNote JSON (PartialBlock[])
  topImageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number;
  user: {
    id: string;
    displayName: string | null;
    image: string | null;
    userId: string | null;
  };
  topic: {
    id: string;
    name: string;
  };
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
};

interface ArticleListProps {
  articles: ArticleWithRelations[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">記事が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function ArticleCard({ article }: { article: ArticleWithRelations }) {
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    // より一貫性のある日付フォーマット（ハイドレーション対策）
    return new Date(date).toLocaleDateString("ja-JP");
  };

  const getContentPreview = (content: ArticleContent) => {
    if (!content || !Array.isArray(content)) return "内容がありません...";

    // BlockNote JSON形式の場合
    const text = content
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
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  return (
    <Link
      href={`/${article.user.userId}/articles/${article.id}`}
      className="block"
    >
      <Card className="h-full flex flex-col hover:bg-muted transition-all duration-300 gap-2 cursor-pointer">
        <CardHeader className="p-0">
          {article.topImageUrl && (
            <div className="relative w-full h-48">
              <Image
                src={article.topImageUrl}
                alt={article.title}
                fill
                className="object-cover rounded-t-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/mhz8="
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <div className="mb-3">
            <Badge variant="secondary" className="text-primary bg-primary/10">
              {article.topic.name}
            </Badge>
          </div>

          <CardTitle className="mb-2 line-clamp-1">{article.title}</CardTitle>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {getContentPreview(article.content)}
          </p>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {article.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
          <AuthorCard
            user={{
              id: article.user.id,
              displayName: article.user.displayName,
              image: article.user.image,
              userId: article.user.userId || "", // フォールバック値
            }}
            size="small"
            clickable={false} // ネストしたリンクを避けるためクリック無効
          />

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="whitespace-nowrap">
              {formatDate(article.publishedAt)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">👁</span>
              <span>{article.viewCount}</span>
              <span className="text-muted-foreground">❤️</span>
              <span>{article.likeCount}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
