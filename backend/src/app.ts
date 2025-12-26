// backend/src/app.ts
import "dotenv/config"; // 環境変数を読み込み
import Fastify from "fastify";
import { testConnection } from "./lib/db.js";
import { authPlugin } from "./plugins/auth.js";
import debugRoute from "./routes/debug.js";
import { healthRoute } from "./routes/health.js";
import meRoute from "./routes/me.js";
import { protectedRoute } from "./routes/protected.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // HTTPエラーハンドリングプラグインを登録
  app.register(import("@fastify/sensible"));

  // PostgreSQL 接続確認
  app.ready(async () => {
    await testConnection();
  });

  // Auth0設定からプラグインを登録
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;

  if (auth0Domain && auth0Audience) {
    // 認証プラグインを先に登録
    app.register(authPlugin, {
      domain: auth0Domain,
      audience: auth0Audience,
    });
  } else {
    app.log.warn("Auth0 configuration missing. JWT validation disabled.");
  }

  // ルートを登録（認証プラグインの後）
  app.register(healthRoute);
  app.register(protectedRoute);
  app.register(meRoute); // /me エンドポイント追加
  app.register(debugRoute); // デバッグエンドポイント（一時的）

  return app;
}
