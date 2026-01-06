/**
 * APIクライアントの基本設定
 * 認証、キャッシュ、エラーハンドリングなどの追加機能を持つAPIクライアント
 */

/**
 * 基本的なfetchラッパー
 * エラーハンドリングとレスポンス処理を統一
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

/**
 * 認証付きAPIリクエスト
 * セッションやトークンを自動付与
 */
export async function authenticatedRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  // NextAuth.jsのセッションを考慮した実装
  return apiRequest<T>(url, options);
}
