// backend/src/types/fastify.d.ts
import "fastify";
import { AuthUser } from "./auth";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }

  interface FastifyRequest {
    user?: AuthUser;
  }
}
