"use client";

import { useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { articleSchema } from "../lib/blocknoteSchema";
import { useTheme } from "@/shared";
import type { CustomPartialBlock } from "@/entities";

interface ArticleViewerProps {
  content: CustomPartialBlock[];
  className?: string;
}

export function ArticleViewerClient({
  content,
  className = "",
}: ArticleViewerProps) {
  const { theme } = useTheme();

  // 記事表示用のBlockNoteエディター（読み取り専用）
  const readOnlyEditor = useCreateBlockNote({
    schema: articleSchema,
    initialContent:
      content && content.length > 0
        ? content
        : [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "記事の内容がありません", styles: {} },
              ],
            },
          ],
    editable: false,
  });

  // テーマ設定
  const blockNoteTheme = useMemo(() => {
    return theme === "dark" ? "dark" : "light";
  }, [theme]);

  // editorが初期化されるまで描画しない
  if (!readOnlyEditor) {
    return (
      <div className="min-h-[200px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">記事を初期化中...</div>
      </div>
    );
  }

  return (
    <div className={`blocknote-article-display ${className}`}>
      <BlockNoteView
        editor={readOnlyEditor}
        theme={blockNoteTheme}
        className="min-h-[200px] w-full"
        editable={false}
      />
    </div>
  );
}
