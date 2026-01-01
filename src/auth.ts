import { prisma } from "@/shared";
import bcryptjs from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
// import Google from "next-auth/providers/google";

async function getAccount(loginId: string) {
  return await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: loginId,
      },
    },
    include: { user: true },
  });
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    // credentials という provider の Account を探し、パスワードが合えば、その Account が紐づく User を返す
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({
            loginId: z.string().nonempty(),
            password: z.string().min(8),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const { loginId, password } = parsed.data;
        const account = await getAccount(loginId);
        if (!account?.access_token) return null;
        const ok = await bcryptjs.compare(password, account.access_token);
        if (!ok) return null;
        return account.user;
      },
    }),
    // Google
  ],
});
