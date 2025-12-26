// backend/src/types/auth.ts
export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  aud: string | string[];
  iss: string;
  iat: number;
  exp: number;
  azp?: string;
  scope?: string;
  [key: string]: unknown;
}

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthUser;
    user?: AuthUser;
  }
}
