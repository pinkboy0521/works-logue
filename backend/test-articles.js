// test-articles.js
import "dotenv/config";

// テスト用のAuth0トークンを環境変数から取得
const TEST_TOKEN = process.env.TEST_AUTH0_TOKEN;
const BASE_URL = "http://localhost:8080";

async function testArticleAPI() {
  try {
    console.log("📝 記事API テスト開始...");

    if (!TEST_TOKEN) {
      console.log("❌ TEST_AUTH0_TOKEN環境変数が設定されていません");
      console.log("Auth0からJWTトークンを取得して設定してください");
      return;
    }

    const headers = {
      Authorization: `Bearer ${TEST_TOKEN}`,
      "Content-Type": "application/json",
    };

    // 1. Health Check
    console.log("\n1️⃣ Health Check...");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log("✅ Health:", health);

    // 2. Me エンドポイント（ユーザー情報確認）
    console.log("\n2️⃣ ユーザー情報取得...");
    const meResponse = await fetch(`${BASE_URL}/me`, { headers });
    if (meResponse.ok) {
      const me = await meResponse.json();
      console.log("✅ ユーザー情報:", me);
    } else {
      console.log("❌ ユーザー情報取得失敗:", await meResponse.text());
      return;
    }

    // 3. 記事作成
    console.log("\n3️⃣ 記事作成（下書き）...");
    const createResponse = await fetch(`${BASE_URL}/articles`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "テスト記事のタイトル",
        content:
          "これはテスト記事の内容です。記事APIが正常に動作しているか確認します。",
      }),
    });

    if (createResponse.ok) {
      const article = await createResponse.json();
      console.log("✅ 記事作成成功:", article);

      const articleId = article.id;

      // 4. 記事更新
      console.log("\n4️⃣ 記事更新...");
      const updateResponse = await fetch(`${BASE_URL}/articles/${articleId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: "テスト記事のタイトル（更新版）",
          content: "これは更新されたテスト記事の内容です。",
        }),
      });

      if (updateResponse.ok) {
        const updatedArticle = await updateResponse.json();
        console.log("✅ 記事更新成功:", updatedArticle);
      } else {
        console.log("❌ 記事更新失敗:", await updateResponse.text());
      }

      // 5. 記事公開
      console.log("\n5️⃣ 記事公開...");
      const publishResponse = await fetch(
        `${BASE_URL}/articles/${articleId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TEST_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // 空のJSONオブジェクトを送信
        }
      );

      if (publishResponse.ok) {
        const publishedArticle = await publishResponse.json();
        console.log("✅ 記事公開成功:", publishedArticle);
      } else {
        console.log("❌ 記事公開失敗:", await publishResponse.text());
      }

      // 6. 記事一覧取得
      console.log("\n6️⃣ 記事一覧取得...");
      const listResponse = await fetch(`${BASE_URL}/articles`, { headers });

      if (listResponse.ok) {
        const articles = await listResponse.json();
        console.log("✅ 記事一覧取得成功:", articles);
      } else {
        console.log("❌ 記事一覧取得失敗:", await listResponse.text());
      }
    } else {
      console.log("❌ 記事作成失敗:", await createResponse.text());
    }
  } catch (error) {
    console.error("❌ テスト中にエラー:", error);
  }
}

// Node.js 18以降ではfetchが使用可能
testArticleAPI();
