// backend/src/routes/debug.ts
import type { FastifyInstance } from "fastify";
import https from "https";
import { pool } from "../lib/db.js";

export default async function debugRoute(fastify: FastifyInstance) {
  // データベース接続確認用エンドポイント（一時的）
  fastify.get("/debug/db", async (request, reply) => {
    try {
      console.log("🔍 データベース接続テスト開始");

      // 基本的な接続確認
      const basicTest = await pool.query("SELECT 1 as test");
      console.log("✅ SELECT 1 成功:", basicTest.rows[0]);

      // 現在時刻取得
      const timeTest = await pool.query("SELECT NOW() as current_time");
      console.log("✅ 現在時刻取得成功:", timeTest.rows[0]);

      // usersテーブル確認
      const userCount = await pool.query(
        "SELECT COUNT(*) as user_count FROM users"
      );
      console.log("✅ usersテーブル確認成功:", userCount.rows[0]);

      // 最新のユーザー取得
      const latestUser = await pool.query(`
        SELECT id, external_subject, email, name, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      return reply.send({
        status: "success",
        message: "データベース接続確認成功",
        tests: {
          basic_select: basicTest.rows[0],
          current_time: timeTest.rows[0],
          user_count: userCount.rows[0],
          latest_user: latestUser.rows[0] || null,
        },
        database_info: {
          host: process.env.DB_HOST || "localhost",
          database: process.env.DB_NAME || "works_logue",
          user: process.env.DB_USER || "works_logue_app",
        },
      });
    } catch (error) {
      console.error("❌ データベース接続エラー:", error);
      return reply.status(500).send({
        status: "error",
        message: "データベース接続に失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  });

  // JWKSアクセステスト用エンドポイント
  fastify.get("/debug/test-jwks", async (request, reply) => {
    try {
      console.log("🔍 JWKS アクセステスト開始");

      const jwksUrl =
        "https://works-logue-dev.jp.auth0.com/.well-known/jwks.json";
      console.log("🌐 JWKS URL:", jwksUrl);

      return new Promise((resolve, reject) => {
        https
          .get(jwksUrl, (res) => {
            console.log("📊 Response status:", res.statusCode);

            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });

            res.on("end", () => {
              try {
                const jwks = JSON.parse(data);
                console.log("✅ JWKS accessible");
                console.log("🔑 Keys found:", jwks.keys?.length || 0);

                if (jwks.keys?.[0]?.kid) {
                  console.log("🆔 First key ID:", jwks.keys[0].kid);
                }

                resolve(
                  reply.send({
                    status: "success",
                    message: "JWKS accessible from Cloud Run",
                    jwks_url: jwksUrl,
                    response_status: res.statusCode,
                    keys_found: jwks.keys?.length || 0,
                    first_key_id: jwks.keys?.[0]?.kid || null,
                  })
                );
              } catch (parseError) {
                console.error("❌ JSON parse error:", parseError);
                reject(
                  reply.status(500).send({
                    status: "error",
                    message: "JWKS response parse failed",
                    parse_error:
                      parseError instanceof Error
                        ? parseError.message
                        : "Unknown error",
                  })
                );
              }
            });
          })
          .on("error", (err) => {
            console.error("❌ HTTPS request failed:", err);
            reject(
              reply.status(500).send({
                status: "error",
                message: "Failed to fetch JWKS from Cloud Run",
                error: err.message,
              })
            );
          });
      });
    } catch (error) {
      console.error("❌ JWKS テストエラー:", error);
      return reply.status(500).send({
        status: "error",
        message: "JWKS テストに失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  });

  // 環境変数確認用エンドポイント（機密情報は隠す）
  fastify.get("/debug/env", async (request, reply) => {
    try {
      console.log("🔍 環境変数確認");

      const envInfo = {
        auth0_domain: process.env.AUTH0_DOMAIN ? "✅ Set" : "❌ Missing",
        auth0_issuer: process.env.AUTH0_ISSUER ? "✅ Set" : "❌ Missing",
        auth0_audience: process.env.AUTH0_AUDIENCE ? "✅ Set" : "❌ Missing",
        db_host: process.env.DB_HOST ? "✅ Set" : "❌ Missing",
        db_name: process.env.DB_NAME ? "✅ Set" : "❌ Missing",
        db_user: process.env.DB_USER ? "✅ Set" : "❌ Missing",
        db_password: process.env.DB_PASSWORD ? "✅ Set" : "❌ Missing",
        database_url: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
        node_env: process.env.NODE_ENV || "development",
        port: process.env.PORT || "3001",
      };

      // 値のサンプル（機密情報は最初の数文字だけ）
      const sampleValues = {
        auth0_domain:
          process.env.AUTH0_DOMAIN?.substring(0, 20) + "..." || "Missing",
        auth0_issuer:
          process.env.AUTH0_ISSUER?.substring(0, 30) + "..." || "Missing",
        auth0_audience:
          process.env.AUTH0_AUDIENCE?.substring(0, 20) + "..." || "Missing",
      };

      return reply.send({
        status: "success",
        message: "Environment variables check",
        env_status: envInfo,
        sample_values: sampleValues,
      });
    } catch (error) {
      console.error("❌ 環境変数確認エラー:", error);
      return reply.status(500).send({
        status: "error",
        message: "環境変数確認に失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  });

  // JWTトークンデバッグ用エンドポイント
  fastify.get("/debug/jwt", async (request, reply) => {
    try {
      const authorization = request.headers.authorization;

      if (!authorization || !authorization.startsWith("Bearer ")) {
        return reply.status(400).send({
          status: "error",
          message: "Authorization header missing or invalid format",
        });
      }

      const token = authorization.slice(7);

      // トークンを base64 デコードしてペイロード部分を取得
      function parseJwt(token: string) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, "base64")
              .toString("utf8")
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          return JSON.parse(jsonPayload);
        } catch (err) {
          console.error("JWT parsing error:", err);
          return null;
        }
      }

      const decoded = parseJwt(token);

      if (!decoded) {
        return reply.status(400).send({
          status: "error",
          message: "Failed to decode JWT token",
        });
      }

      const now = Math.floor(Date.now() / 1000);

      return reply.send({
        status: "success",
        message: "JWT token analysis",
        token_info: {
          header_present: !!authorization,
          token_length: token.length,
          token_preview: token.substring(0, 50) + "...",
        },
        decoded_payload: {
          issuer: decoded.iss,
          audience: decoded.aud,
          subject: decoded.sub,
          email: decoded.email || "N/A",
          issued_at: decoded.iat
            ? new Date(decoded.iat * 1000).toISOString()
            : "N/A",
          expires_at: decoded.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : "N/A",
          not_before: decoded.nbf
            ? new Date(decoded.nbf * 1000).toISOString()
            : "N/A",
        },
        validation: {
          current_time: new Date().toISOString(),
          current_timestamp: now,
          is_expired: decoded.exp ? now >= decoded.exp : false,
          is_before_nbf: decoded.nbf ? now < decoded.nbf : false,
          time_until_expiry: decoded.exp ? decoded.exp - now : "N/A",
        },
        expected_config: {
          expected_audience: process.env.AUTH0_AUDIENCE?.trim(),
          expected_issuer: process.env.AUTH0_ISSUER?.trim(),
          audience_match: decoded.aud === process.env.AUTH0_AUDIENCE?.trim(),
          issuer_match: decoded.iss === process.env.AUTH0_ISSUER?.trim(),
        },
      });
    } catch (error) {
      console.error("❌ JWT デバッグエラー:", error);
      return reply.status(500).send({
        status: "error",
        message: "JWT デバッグに失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  });
}
