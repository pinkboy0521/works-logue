"use client";

import dynamic from "next/dynamic";
import type { CustomPartialBlock } from "@/entities";

// SSRを無効化してクライアントでのみ描画
const ArticleViewerClient = dynamic(
  () =>
    import("./ArticleViewerClient").then((mod) => ({
      default: mod.ArticleViewerClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">記事を読み込み中...</div>
      </div>
    ),
  },
);

interface ArticleViewerProps {
  content: CustomPartialBlock[];
  className?: string;
}

export function ArticleViewer(props: ArticleViewerProps) {
  return <ArticleViewerClient {...props} />;
}
