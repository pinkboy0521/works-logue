/**
 * 画像アップロード API関数
 */

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  publicId: string;
  folder: string;
  uploadUrl: string;
}

/**
 * 画像アップロード署名を取得
 */
export async function getImageUploadSignature(): Promise<UploadSignature> {
  const signatureResponse = await fetch("/api/upload/article-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!signatureResponse.ok) {
    const errorText = await signatureResponse.text();
    console.error("Signature API error:", signatureResponse.status, errorText);
    throw new Error("署名の取得に失敗しました");
  }

  const signature = await signatureResponse.json();
  console.log("Received signature:", {
    hasSignature: !!signature.signature,
    timestamp: signature.timestamp,
    cloudName: signature.cloudName,
    publicId: signature.publicId,
  });

  return signature;
}

/**
 * Cloudinaryに画像をアップロード
 */
export async function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", signature.folder);
  formData.append("public_id", signature.publicId);
  formData.append("timestamp", signature.timestamp.toString());
  formData.append("transformation", "c_limit,w_1200,h_800,q_auto,f_auto");
  formData.append("api_key", signature.apiKey);
  formData.append("signature", signature.signature);

  const uploadResponse = await fetch(signature.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("Cloudinary upload error:", uploadResponse.status, errorText);
    throw new Error(
      `画像のアップロードに失敗しました (${uploadResponse.status}): ${errorText}`,
    );
  }

  const result = await uploadResponse.json();
  return result.secure_url;
}

/**
 * 画像ファイルをアップロードして、URLを返す
 */
export async function uploadImageFile(file: File): Promise<string> {
  const signature = await getImageUploadSignature();
  const imageUrl = await uploadToCloudinary(file, signature);
  return imageUrl;
}
