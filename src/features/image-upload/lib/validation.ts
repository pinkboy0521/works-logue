/**
 * 画像ファイルバリデーション
 */

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

/**
 * ファイルサイズを検証（デフォルト5MB）
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): void {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new ImageValidationError(
      `ファイルサイズは${maxSizeMB}MB以下にしてください`,
    );
  }
}

/**
 * ファイル形式を検証（画像ファイルのみ）
 */
export function validateFileType(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new ImageValidationError("画像ファイルを選択してください");
  }
}

/**
 * 画像ファイルの完全バリデーション
 */
export function validateImageFile(file: File): void {
  validateFileType(file);
  validateFileSize(file);
}

/**
 * 複数画像ファイルのフィルタリング
 */
export function filterImageFiles(files: FileList | File[]): File[] {
  const fileArray = Array.from(files);
  return fileArray.filter((file) => file.type.startsWith("image/"));
}
