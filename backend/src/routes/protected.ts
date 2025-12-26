// backend/src/routes/protected.ts
import { FastifyPluginAsync } from "fastify";

export const protectedRoute: FastifyPluginAsync = async (app) => {
  app.get("/protected", async (request) => {
    // JWT検証プラグインによって request.auth が設定されている
    return {
      message: "This is a protected endpoint",
      user: {
        id: request.auth!.sub,
        audience: request.auth!.aud,
        issuer: request.auth!.iss,
      },
    };
  });
};
