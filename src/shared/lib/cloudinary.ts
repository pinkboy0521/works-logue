import { v2 as cloudinary } from "cloudinary";

// ビルド時には環境変数がないことを許可し、実行時にチェックする
function ensureCloudinaryConfig() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are not defined");
  }
}

// Cloudinaryの設定を遅延初期化
function configureCloudinary() {
  ensureCloudinaryConfig();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface SignedUploadResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset?: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  format: string;
  resource_type: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * プロフィール画像用の署名付きアップロードパラメータを生成
 */
export function generateProfileImageUploadSignature(
  userId: string
): SignedUploadResponse {
  // 実行時にCloudinaryを初期化
  configureCloudinary();

  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `users/${userId}/profile`;

  const params = {
    timestamp,
    public_id: publicId,
    folder: "users/profiles",
    transformation: "c_fill,g_face,h_400,w_400,q_auto,f_auto",
  };

  // デバッグ用ログ
  console.log("Signing params:", params);
  console.log("API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

  // upload_presetがある場合は署名に含めない（unsigned uploadの場合のみ使用）
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  console.log("Generated signature:", signature);

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}

/**
 * プロフィール画像用の最適化されたURLを生成
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  // 実行時にCloudinaryを初期化
  configureCloudinary();

  const {
    width = 400,
    height = 400,
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: "fill", gravity: "face" },
      { quality, fetch_format: format },
    ],
  });
}

/**
 * 古いプロフィール画像を削除
 */
export async function deleteImage(publicId: string): Promise<void> {
  // 実行時にCloudinaryを初期化
  configureCloudinary();

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Image deleted: ${publicId}`);
  } catch (error) {
    console.error("Error deleting image:", error);
    // 削除エラーは非致命的なので、エラーを投げずにログ出力のみ
  }
}

export default cloudinary;
