import Image from "next/image";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
    name: string | null;
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
        <p className="text-gray-500">記事が見つかりません</p>
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
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow gap-xs">
      <CardHeader className="p-0">
        {article.topImageUrl && (
          <div className="relative w-full h-48">
            <Image
              src={article.topImageUrl}
              alt={article.title}
              fill
              className="object-cover rounded-m"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-s">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
            {article.topic.name}
          </span>
        </div>

        <CardTitle className="mb-2 line-clamp-1">
          <Link
            href={`/articles/${article.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </Link>
        </CardTitle>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {getContentPreview(article.content)}
        </p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {article.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 -mx-l px-l flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage
              src={article.user.image || ""}
              alt={article.user.name || ""}
            />
            <AvatarFallback>
              {article.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{article.user.name || "Anonymous"}</span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="whitespace-nowrap">
            {formatDate(article.publishedAt)}
          </span>
          <div className="flex items-center gap-2">
            <span>👁 {article.viewCount}</span>
            <span>❤️ {article.likeCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
