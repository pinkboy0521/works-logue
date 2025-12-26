// backend/src/app.ts
import Fastify from "fastify";
import { authPlugin } from "./plugins/auth.js";
import { healthRoute } from "./routes/health.js";
import { protectedRoute } from "./routes/protected.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // HTTPエラーハンドリングプラグインを登録
  app.register(import("@fastify/sensible"));

  // Auth0設定からプラグインを登録
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;

  if (auth0Domain && auth0Audience) {
    app.register(authPlugin, {
      domain: auth0Domain,
      audience: auth0Audience,
    });
  } else {
    app.log.warn("Auth0 configuration missing. JWT validation disabled.");
  }

  app.register(healthRoute);
  app.register(protectedRoute);

  return app;
}
