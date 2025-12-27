// backend/test-articles-api.js
import "dotenv/config";

const API_BASE = "http://localhost:8080";

// ダミーのJWTトークン（テスト用）
// 実際には Auth0 からの有効なトークンが必要
const DUMMY_TOKEN = "Bearer dummy-token-for-test";

// 記事作成テスト
async function testCreateArticle() {
  console.log("\n=== 記事作成テスト ===");

  try {
    const response = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: DUMMY_TOKEN,
      },
      body: JSON.stringify({
        title: "テスト記事",
        content: "これはテスト用の記事内容です。",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const article = await response.json();
    console.log("✅ 記事作成成功:", article);
    return article.id;
  } catch (error) {
    console.error("❌ 記事作成失敗:", error.message);
    return null;
  }
}

// healthチェック
async function testHealth() {
  console.log("\n=== ヘルスチェック ===");
  try {
    const response = await fetch(`${API_BASE}/health`);
    const result = await response.json();
    console.log("✅ ヘルスチェック成功:", result);
  } catch (error) {
    console.error("❌ ヘルスチェック失敗:", error.message);
  }
}

async function runTests() {
  await testHealth();

  // Auth0設定が必要なため、認証が有効な場合はスキップ
  console.log("\n⚠️  記事APIテストには有効なJWTトークンが必要です");
  console.log("トークンなしでテストを実行すると401エラーが期待されます");

  await testCreateArticle();
}

runTests();
