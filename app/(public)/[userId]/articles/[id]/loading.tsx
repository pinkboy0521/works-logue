export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <article className="space-y-8 animate-pulse">
        {/* ヘッダー情報のスケルトン */}
        <header className="space-y-6">
          {/* トピック */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-muted rounded-full"></div>
          </div>

          {/* タイトル */}
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>

          {/* メタ情報 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              {/* 著者情報 */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </div>

              {/* 公開日時 */}
              <div className="flex items-center gap-1">
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            </div>

            {/* 統計情報 */}
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

          {/* タグ */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-muted rounded"></div>
            <div className="h-6 w-20 bg-muted rounded"></div>
            <div className="h-6 w-14 bg-muted rounded"></div>
          </div>
        </header>

        {/* トップ画像のスケルトン */}
        <div className="relative w-full h-64 md:h-80 lg:h-96 bg-muted rounded-lg"></div>

        {/* 記事コンテンツのスケルトン */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="p-6 md:p-8 space-y-4">
            {/* パラグラフのスケルトン */}
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/5"></div>
            </div>

            {/* 見出しのスケルトン */}
            <div className="mt-6">
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </div>

            {/* パラグラフのスケルトン */}
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>

            {/* コードブロックのスケルトン */}
            <div className="mt-6">
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>

            {/* パラグラフのスケルトン */}
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-4/5"></div>
            </div>
          </div>
        </div>

        {/* 著者情報のスケルトン */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
