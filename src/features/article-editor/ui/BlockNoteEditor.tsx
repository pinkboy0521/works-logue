"use client";

import { useCallback, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Block } from "@blocknote/core";
import { useTheme } from "@/shared";
import { ja } from "@blocknote/core/locales";
import { articleSchema } from "../lib/blocknoteSchema";
import type { CustomPartialBlock } from "@/entities";

interface BlockNoteEditorProps {
  value?: string;
  onChange?: (content: Block[]) => void;
  initialContent?: Block[];
  editable?: boolean;
  className?: string;
}

export type { BlockNoteEditorProps };

export function BlockNoteEditor({
  onChange,
  initialContent,
  editable = true,
  className,
}: BlockNoteEditorProps) {
  const { theme } = useTheme();

  // 共有スキーマを使用してBlockNoteエディターを初期化
  const editor = useCreateBlockNote({
    schema: articleSchema,
    dictionary: ja,
    initialContent:
      initialContent &&
      Array.isArray(initialContent) &&
      initialContent.length > 0
        ? (initialContent as CustomPartialBlock[])
        : [
            {
              type: "paragraph",
              content: [{ type: "text", text: "", styles: {} }],
            },
          ],
    editable,
    trailingBlock: true,
    animations: true,
  });

  // コンテンツ変更時のコールバック
  const handleChange = useCallback(() => {
    if (onChange && editor) {
      onChange(editor.document);
    }
  }, [onChange, editor]);

  // テーマ設定
  const blockNoteTheme = useMemo(() => {
    return theme === "dark" ? "dark" : "light";
  }, [theme]);

  // editorが初期化されるまで描画しない
  if (!editor) {
    return (
      <div className="min-h-[200px] w-full flex items-center justify-center border rounded-md">
        <div className="text-muted-foreground">エディターを初期化中...</div>
      </div>
    );
  }

  return (
    <div className={`blocknote-editor-container w-full ${className || ""}`}>
      <BlockNoteView
        editor={editor}
        theme={blockNoteTheme}
        onChange={handleChange}
        className="blocknote-editor min-h-[200px] w-full"
      />
    </div>
  );
}