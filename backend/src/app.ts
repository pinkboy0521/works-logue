// backend/src/app.ts
import "dotenv/config"; // 環境変数を読み込み
import Fastify from "fastify";
import { testConnection } from "./lib/db.js";
import { authPlugin } from "./plugins/auth.js";
import debugRoute from "./routes/debug.js";
import { healthRoute } from "./routes/health.js";
import meRoute from "./routes/me.js";
import { protectedRoute } from "./routes/protected.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // HTTPエラーハンドリングプラグインを登録
  await app.register(import("@fastify/sensible"));

  // PostgreSQL 接続確認
  app.ready(async () => {
    await testConnection();
  });

  // Auth0設定からプラグインを登録
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;

  if (auth0Domain && auth0Audience) {
    // 認証プラグインを登録
    await app.register(authPlugin, {
      domain: auth0Domain,
      issuer: process.env.AUTH0_ISSUER!,
      audience: auth0Audience,
    });
  } else {
    app.log.warn("Auth0 configuration missing. JWT validation disabled.");
  }

  // ルートを登録（認証プラグインの後）
  await app.register(healthRoute);
  await app.register(protectedRoute);
  await app.register(meRoute); // /me エンドポイント追加
  await app.register(debugRoute); // デバッグエンドポイント（一時的）

  return app;
}
