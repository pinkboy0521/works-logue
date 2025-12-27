import { Auth0Client } from "@auth0/nextjs-auth0/server";

// v4では環境変数を自動的に読み取る
export const auth0 = new Auth0Client();
