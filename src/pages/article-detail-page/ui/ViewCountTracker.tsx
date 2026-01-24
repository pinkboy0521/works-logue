"use client";

import { useEffect } from "react";
import { incrementArticleViews } from "@/entities";

interface ViewCountTrackerProps {
  articleId: string;
}

/**
 * 記事の閲覧数を初回訪問時のみ増加させるクライアントコンポーネント
 * Server Actionによる再レンダリング時には実行されない
 */
export function ViewCountTracker({ articleId }: ViewCountTrackerProps) {
  useEffect(() => {
    // ページが完全に読み込まれた時のみ閲覧数を増加
    const hasIncrementedView = sessionStorage.getItem(`viewed-${articleId}`);

    if (!hasIncrementedView) {
      // 初回訪問時のみ閲覧数を増加
      incrementArticleViews(articleId)
        .then(() => {
          // セッション中は同じ記事の閲覧数を重複カウントしない
          sessionStorage.setItem(`viewed-${articleId}`, "true");
        })
        .catch(console.error);
    }
  }, [articleId]);

  // このコンポーネントはUIをレンダリングしない
  return null;
}
