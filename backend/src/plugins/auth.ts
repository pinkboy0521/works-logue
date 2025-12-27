// backend/src/plugins/auth.ts
import { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwt, { Algorithm } from "jsonwebtoken";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jwksClient from "jwks-client";
import { AuthUser } from "../types/auth.js";

interface AuthPluginOptions {
  domain: string;
  issuer: string;
  audience: string;
  algorithms?: Algorithm[];
}

const authPluginImplementation: FastifyPluginAsync<AuthPluginOptions> = async (
  app,
  options
) => {
  const { domain, issuer, audience, algorithms = ["RS256"] } = options;

  // JWKS クライアント設定
  const client = jwksClient({
    jwksUri: `https://${domain}/.well-known/jwks.json`,
    cache: true,
    cacheMaxAge: 24 * 60 * 60 * 1000, // 24時間
  });

  // 署名キーを取得する関数
  function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, (err: any, key: any) => {
      if (err) {
        return callback(err);
      }
      const signingKey = key!.publicKey || key!.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  // 認証デコレーター（他のルートで使用可能）
  app.decorate("authenticate", async (request: FastifyRequest, reply: any) => {
    const authorization = request.headers.authorization;

    console.log("🔐 JWT認証開始");
    console.log(
      "📍 Authorization header:",
      authorization ? "Present" : "Missing"
    );

    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("❌ Authorization header missing or invalid");
      throw app.httpErrors.unauthorized(
        "Missing or invalid authorization header"
      );
    }

    const token = authorization.slice(7); // "Bearer " を除去
    console.log(
      "🎫 Token received (first 20 chars):",
      token.substring(0, 20) + "..."
    );

    try {
      console.log("🔧 JWT設定:", {
        domain,
        issuer,
        audience,
        algorithms,
      });

      // JWT検証
      const decoded = await new Promise<AuthUser>((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            audience,
            issuer,
            algorithms,
            clockTolerance: 60, // 60秒の時刻ずれ許容
          },
          (err: any, decoded: any) => {
            if (err) {
              console.error("❌ JWT verify error:", {
                message: err.message,
                name: err.name,
                stack: err.stack,
              });
              reject(err);
            } else {
              console.log("✅ JWT verification successful");
              console.log("👤 Decoded user info:", {
                sub: decoded.sub,
                email: decoded.email,
                aud: decoded.aud,
                iss: decoded.iss,
              });
              resolve(decoded as AuthUser);
            }
          }
        );
      });

      // リクエストにユーザー情報を追加
      (request as any).user = decoded;
    } catch (error) {
      console.error("❌ JWT verification failed:", error);
      app.log.error({ error }, "JWT verification failed");
      throw app.httpErrors.unauthorized("Invalid token");
    }
  });
};

// fastify-plugin でラップして親スコープで利用可能にする
export const authPlugin = fp(authPluginImplementation, {
  name: "auth-plugin",
  fastify: "4.x",
});
