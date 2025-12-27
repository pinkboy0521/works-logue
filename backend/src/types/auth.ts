// backend/src/types/auth.ts
export interface AuthUser {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
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
