import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/shared";
import { type ArticleWithDetails } from "../model";

/**
 * 記事のスケルトン表示コンポーネント
 * ビジネスモデルの基本的なUI表現
 */
export function ArticleCard({ article }: { article: ArticleWithDetails }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{article.title}</CardTitle>
          <Badge
            variant={article.status === "PUBLISHED" ? "default" : "secondary"}
          >
            {article.status === "PUBLISHED" ? "公開" : "下書き"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {(() => {
            if (!article.content || !Array.isArray(article.content))
              return "内容なし";

            // BlockNote JSON形式の場合
            const textBlocks = article.content
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
            return textBlocks.slice(0, 150) || "内容なし";
          })()}
          ...
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * 記事メタ情報の表示コンポーネント
 */
export function ArticleMetaDisplay({
  article,
}: {
  article: ArticleWithDetails;
}) {
  return (
    <div className="text-sm text-muted-foreground">
      <p>作成者: {article.user.displayName}</p>
      <p>作成日: {new Date(article.createdAt).toLocaleDateString()}</p>
      {article.topic && <p>トピック: {article.topic.name}</p>}
    </div>
  );
}
