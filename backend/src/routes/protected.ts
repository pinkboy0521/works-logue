// backend/src/routes/protected.ts
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { findOrCreateUser } from "../domain/user-service.js";
import type { AuthUser } from "../types/auth.js";

// JWT検証済みリクエストの型
interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

export const protectedRoute: FastifyPluginAsync = async (app) => {
  app.get(
    "/protected",
    {
      preHandler: async function (request, reply) {
        await app.authenticate(request, reply);
      },
    },
    async (request) => {
      // JWT から認証済みユーザー情報を取得
      const authRequest = request as AuthenticatedRequest;
      const authUser = authRequest.user;

      // ユーザーを自動確定（users テーブルの ID を取得）
      const user = await findOrCreateUser({
        external_subject: authUser.sub,
        email: authUser.email || `user-${authUser.sub}@auth0.com`,
        name: authUser.name || "Unknown User",
      });

      return {
        message: "This is a protected endpoint",
        auth0: {
          sub: authUser.sub,
          email: authUser.email,
          name: authUser.name,
        },
        app_user: {
          id: user.id, // 必ずusers.idを使用
          email: user.email,
          name: user.name,
        },
      };
    }
  );
};
