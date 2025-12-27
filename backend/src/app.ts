// backend/src/app.ts
import "dotenv/config"; // 環境変数を読み込み
import Fastify from "fastify";
import { testConnection } from "./lib/db.js";
import { authPlugin } from "./plugins/auth.js";
import articlesRoute from "./routes/articles.js";
import { healthRoute } from "./routes/health.js";
import meRoute from "./routes/me.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // 環境ベースのCORS設定
  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    const isDev = process.env.NODE_ENV === "development";
    const allowLocalhost = process.env.ALLOW_LOCALHOST === "true";

    // Originがない場合（curl/health check等）はCORS処理をスキップ
    if (!origin) return;

    const allowedOrigins = [
      isDev || allowLocalhost ? "http://localhost:3000" : null,
      process.env.FRONTEND_ORIGIN,
    ].filter(Boolean);

    if (!allowedOrigins.includes(origin)) {
      return reply.code(403).send({ error: "CORS: Origin not allowed" });
    }

    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    reply.header("Access-Control-Allow-Credentials", "true");

    // プリフライトリクエストに対応（明示的にreturn）
    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }
  });

  // HTTPエラーハンドリングプラグインを登録
  await app.register(import("@fastify/sensible"));

  // PostgreSQL 接続確認
  app.ready(async () => {
    await testConnection();
  });

  // Auth0設定からプラグインを登録
  const auth0Domain = process.env.AUTH0_DOMAIN?.trim();
  const auth0Audience = process.env.AUTH0_AUDIENCE?.trim();
  const auth0Issuer = process.env.AUTH0_ISSUER?.trim();

  if (auth0Domain && auth0Audience && auth0Issuer) {
    // 認証プラグインを登録
    await app.register(authPlugin, {
      domain: auth0Domain,
      issuer: auth0Issuer,
      audience: auth0Audience,
    });
  } else {
    app.log.warn("Auth0 configuration missing. JWT validation disabled.");
  }

  // ルートを登録（認証プラグインの後）
  await app.register(healthRoute);
  await app.register(meRoute); // /me エンドポイント追加
  await app.register(articlesRoute); // 記事API追加

  return app;
}
