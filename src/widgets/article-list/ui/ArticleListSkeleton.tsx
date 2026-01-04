import { Skeleton, Card, CardContent, CardHeader } from "@/shared";

export function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-0">
            {/* 画像エリアのスケルトン */}
            <Skeleton className="h-48 w-full rounded-none" />
          </CardHeader>

          {/* コンテンツエリア */}
          <CardContent className="space-y-4">
            {/* トピック */}
            <Skeleton className="h-4 w-16 rounded-full" />

            {/* タイトル */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* 統計情報 */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-gray-300">👀</span>
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-300">❤️</span>
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
