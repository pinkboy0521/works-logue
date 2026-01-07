"use client";

import { useCallback, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Block } from "@blocknote/core";
import { useTheme } from "@/shared";
import { ja } from "@blocknote/core/locales";

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

  // BlockNoteエディターの初期化
  const editor = useCreateBlockNote({
    dictionary: ja,
    initialContent:
      initialContent &&
      Array.isArray(initialContent) &&
      initialContent.length > 0
        ? initialContent
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

  return (
    <div className={`blocknote-editor-container w-full ${className || ""}`}>
      <BlockNoteView
        editor={editor}
        theme={blockNoteTheme}
        onChange={handleChange}
        className="min-h-[200px] w-full"
      />
      <style jsx global>{`
        .blocknote-editor-container .ProseMirror {
          min-height: 400px;
          padding: 16px;
          outline: none;
          font-family: "Noto Sans", "Noto Sans JP", sans-serif;
        }
        .blocknote-editor-container .bn-editor {
          height: auto;
          min-height: 400px;
          font-family: "Noto Sans", "Noto Sans JP", sans-serif;
        }
        .blocknote-editor-container {
          font-family: "Noto Sans", "Noto Sans JP", sans-serif;
        }
      `}</style>
    </div>
  );
}
