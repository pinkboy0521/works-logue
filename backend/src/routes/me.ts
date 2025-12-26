import { type FastifyInstance, type FastifyRequest } from "fastify";
import { findOrCreateUser } from "../domain/user-service.js";
import type { UserResponse } from "../domain/user.js";
import type { AuthUser } from "../types/auth.js";

// JWT検証済みリクエストの型
interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

export default async function meRoute(app: FastifyInstance) {
  // /me エンドポイント - JWT認証済みユーザー情報取得
  app.get<{}, UserResponse>(
    "/me",
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      try {
        // JWT から認証済みユーザー情報を取得
        const authRequest = request as AuthenticatedRequest;
        const authUser = authRequest.user;

        // ユーザー情報が存在するかチェック
        if (!authUser || !authUser.sub) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "認証ユーザー情報が見つかりません",
          });
        }

        // ユーザーを自動作成（初回ログイン時）または既存取得
        const user = await findOrCreateUser({
          external_subject: authUser.sub,
          email: authUser.email || `user-${authUser.sub}@auth0.com`,
          name: authUser.name || "Unknown User",
        });

        // APIレスポンス（必ずusers.idを使用）
        const response: UserResponse = {
          id: user.id,
          email: user.email,
          name: user.name,
        };

        return reply.send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to get user information");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "ユーザー情報の取得に失敗しました",
        });
      }
    }
  );

  // テスト用エンドポイント（認証なし）- Step9動作確認用
  app.get("/me/test", async (request, reply) => {
    try {
      console.log("🧪 テスト用エンドポイント /me/test が呼ばれました");

      // テスト用のAuth0 sub
      const testSub = "auth0|test123456789";
      console.log("テスト用 Auth0 sub:", testSub);

      // ユーザーを確定（初回は作成、2回目は同じIDを取得）
      const user = await findOrCreateUser({
        external_subject: testSub,
        email: "test@example.com",
        name: "テストユーザー",
      });

      console.log("✅ 確定したユーザー:", {
        id: user.id,
        external_subject: user.external_subject,
        email: user.email,
      });

      return reply.send({
        message: "Step9テスト - ユーザー確定処理成功",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        debug: {
          external_subject: user.external_subject,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error("❌ テスト用エンドポイントエラー:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "ユーザー確定処理テストに失敗しました",
      });
    }
  });
}
