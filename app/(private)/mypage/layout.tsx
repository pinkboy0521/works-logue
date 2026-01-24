import Link from "next/link";
import { Suspense } from "react";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* サイドバーナビゲーション */}
        <aside className="w-64 shrink-0">
          <nav className="space-y-2">
            <Link
              href="/mypage/articles"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md"
            >
              記事管理
            </Link>
            <Link
              href="/mypage/bookmarks"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md"
            >
              ブックマークした記事
            </Link>
            <Link
              href="/mypage/likes"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md"
            >
              いいねした記事
            </Link>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1">
          <Suspense fallback={<div>読み込み中...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
