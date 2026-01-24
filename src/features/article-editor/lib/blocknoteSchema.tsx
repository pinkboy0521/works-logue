"use client";

// 共有BlockNoteスキーマ（編集・表示共通）
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { uploadImageFile } from "@/features/image-upload";

// 画像アップロード関数（API経由）
async function uploadImage(file: File): Promise<string | null> {
  try {
    return await uploadImageFile(file);
  } catch (error) {
    console.error("Upload error:", error);
    alert(error instanceof Error ? error.message : "画像のアップロードに失敗しました");
    return null;
  }
}

// スラッシュメニューアイテム
export const uploadImageSlashMenuItem = {
  name: "Upload Image",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (editor: any) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = await uploadImage(file);
        if (imageUrl && typeof imageUrl === "string") {
          editor.insertBlocks(
            [
              {
                type: "image",
                props: {
                  url: imageUrl,
                  caption: file.name.replace(/\.[^/.]+$/, ""), // 拡張子を除いた名前をキャプションに
                },
              },
            ],
            editor.getTextCursorPosition().block,
            "after",
          );
        }
      }
    };
    input.click();
  },
  aliases: ["image", "img", "upload", "画像", "アップロード"],
  group: "Media",
  icon: "📷",
  hint: "画像をアップロード",
};

// 統一Schema（アプリケーション全体で1つ）
export const articleSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
  },
});

export type ArticleSchema = typeof articleSchema;
