// Cloudinary関数を動的にインポート（サーバーサイドでのみ）
async function generateProfileImageUploadSignature(userId: string) {
  const { generateProfileImageUploadSignature: cloudinaryFunction } =
    await import("@/shared/lib/cloudinary");
  return cloudinaryFunction(userId);
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset?: string;
  publicId: string;
  folder: string;
}

/**
 * プロフィール画像アップロード用の署名付きURLを生成
 */
export async function generateProfileUploadSignature(
  userId: string,
): Promise<UploadSignatureResponse> {
  try {
    const signatureData = await generateProfileImageUploadSignature(userId);
    const publicId = `users/${userId}/profile`;

    return {
      ...signatureData,
      publicId,
      folder: "users/profiles",
    };
  } catch (error) {
    console.error("Failed to generate upload signature:", error);
    throw new Error("アップロード用の署名生成に失敗しました");
  }
}
