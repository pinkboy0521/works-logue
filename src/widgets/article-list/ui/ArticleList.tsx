import Image from "next/image";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared";

type ArticleWithRelations = {
  id: string;
  title: string;
  content: string | null;
  topImageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number;
  user: {
    id: string;
    displayName: string | null;
    image: string | null;
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
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const getContentPreview = (content: string | null) => {
    if (!content) return "内容がありません...";
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  return (
    <Link href={`/${article.user.id}/articles/${article.id}`} className="block">
      <Card className="h-full flex flex-col hover:bg-muted transition-all duration-300 gap-xs cursor-pointer">
        <CardHeader className="p-0">
          {article.topImageUrl && (
            <div className="relative w-full h-48">
              <Image
                src={article.topImageUrl}
                alt={article.title}
                fill
                className="object-cover rounded-m"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/mhz8="
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <div className="mb-s">
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

        <CardFooter className="pt-0 -mx-l px-l flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage
                src={article.user.image || ""}
                alt={article.user.displayName || ""}
              />
              <AvatarFallback>
                {article.user.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {article.user.displayName || "Anonymous"}
            </span>
          </div>

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
