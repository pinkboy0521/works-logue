"use client";

import { useCallback } from "react";
import { uploadImageFile } from "../api/upload-image";
import { validateImageFile, ImageValidationError } from "../lib/validation";

interface UseImageUploadResult {
  uploadImage: (file: File) => Promise<string>;
  isUploading: boolean;
}

/**
 * 画像アップロード用カスタムフック
 */
export function useImageUpload(): UseImageUploadResult {
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      // バリデーション
      validateImageFile(file);

      // アップロード実行
      const imageUrl = await uploadImageFile(file);
      return imageUrl;
    } catch (error) {
      console.error("Upload error:", error);

      // ユーザーフレンドリーなエラーメッセージ
      if (error instanceof ImageValidationError) {
        alert(error.message);
      } else {
        alert(
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました",
        );
      }

      return ""; // 空文字列を返す
    }
  }, []);

  return {
    uploadImage,
    isUploading: false, // TODO: 必要に応じて状態管理を追加
  };
}
