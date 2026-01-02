export function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          {/* 画像エリアのスケルトン */}
          <div className="h-48 bg-muted"></div>

          {/* コンテンツエリア */}
          <div className="p-6 space-y-4">
            {/* トピック */}
            <div className="h-4 w-16 bg-muted rounded-full"></div>

            {/* タイトル */}
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-full"></div>
              <div className="h-5 bg-muted rounded w-3/4"></div>
            </div>

            {/* 統計情報 */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded-full"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-gray-300">👀</span>
                  <div className="h-4 w-8 bg-muted rounded"></div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-300">❤️</span>
                  <div className="h-4 w-8 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
