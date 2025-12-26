// backend/src/plugins/auth.ts
import { FastifyPluginAsync, FastifyRequest } from "fastify";
import jwt, { Algorithm } from "jsonwebtoken";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jwksClient from "jwks-client";
import { AuthUser } from "../types/auth.js";

interface AuthPluginOptions {
  domain: string;
  audience: string;
  algorithms?: Algorithm[];
}

export const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (
  app,
  options
) => {
  const { domain, audience, algorithms = ["RS256"] } = options;

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

  // JWT検証フック
  app.addHook("preHandler", async (request: FastifyRequest, reply) => {
    // ヘルスチェックはスキップ
    if (request.url === "/health") {
      return;
    }

    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw app.httpErrors.unauthorized(
        "Missing or invalid authorization header"
      );
    }

    const token = authorization.slice(7); // "Bearer " を除去

    try {
      // JWT検証
      const decoded = await new Promise<AuthUser>((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            audience,
            issuer: `https://${domain}/`,
            algorithms,
          },
          (err: any, decoded: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(decoded as AuthUser);
            }
          }
        );
      });

      // リクエストにユーザー情報を追加
      request.auth = decoded;
    } catch (error) {
      app.log.error("JWT verification failed: %s", error);
      throw app.httpErrors.unauthorized("Invalid token");
    }
  });
};
