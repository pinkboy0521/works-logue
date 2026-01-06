/**
 * 記事編集機能のAPIメソッド
 */

export interface SaveArticleData {
  title: string;
  content: string;
  topicId?: string;
  status: "DRAFT" | "PUBLISHED";
}

/**
 * 記事の自動保存
 */
export async function autoSaveArticle(
  articleId: string | undefined,
  data: SaveArticleData,
): Promise<{ success: boolean; id?: string }> {
  try {
    const url = articleId ? `/api/articles/${articleId}` : "/api/articles";
    const method = articleId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Auto save failed");
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    console.error("Auto save error:", error);
    return { success: false };
  }
}

/**
 * 記事のプレビュー生成
 */
export async function generateArticlePreview(content: string): Promise<string> {
  try {
    const response = await fetch("/api/articles/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Preview generation failed");
    }

    const result = await response.json();
    return result.html;
  } catch (error) {
    console.error("Preview generation error:", error);
    return content; // フォールバック
  }
}
