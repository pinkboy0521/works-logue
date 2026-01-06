import { prisma } from "@/shared";
import bcryptjs from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
// import Google from "next-auth/providers/google";

/**
 * credentials 用の Account を取得する
 * - provider = "credentials"
 * - providerAccountId = email
 * - User も一緒に取得（ログイン成功時に返すため）
 */
async function getAccount(email: string) {
  return await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: email,
      },
    },
    include: { user: true },
  });
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  /**
   * ===== 認証手段の定義 =====
   * 今回は credentials（メール + パスワード）のみ
   */
  providers: [
    Credentials({
      /**
       * authorize:
       * - ログインフォームから送られてきた値を元に
       *   「この入力は誰か？」を判定する
       * - 成功したら「認証済みユーザー情報」を返す
       * - 失敗したら null を返す
       */
      async authorize(credentials) {
        /**
         * 1. 入力値のバリデーション
         * - email / password が存在するか
         * - password は最低 8 文字
         */
        const parsed = z
          .object({
            email: z.string().nonempty(),
            password: z.string().min(8),
          })
          .safeParse(credentials);
        if (!parsed.success) {
          // フォーム入力が不正
          return null;
        }
        const { email, password } = parsed.data;
        /**
         * 2. credentials 用の Account を取得
         * - email をキーに Account を探す
         * - 同時に紐づく User も取得
         */
        const account = await getAccount(email);
        if (!account?.access_token) {
          // Account が存在しない、または password hash が無い
          return null;
        }
        /**
         * 3. パスワード照合
         * - フォームの平文 password と
         * - DB に保存してある password hash を比較
         */
        const ok = await bcryptjs.compare(password, account.access_token);
        if (!ok) {
          // パスワード不一致
          return null;
        }
        /**
         * 4. 認証成功
         * - 「この人です」という情報を返す
         * - ここで返した user が jwt callback に渡される
         */
        return {
          id: account.user.id,
          name: account.user.displayName,
          email: account.user.email,
        };
      },
    }),
    // Google などの OAuth Provider はここに追加可能
  ],
  /**
   * ===== セッション制御 =====
   * authorize → jwt → session の流れをつなぐ
   */
  callbacks: {
    /**
     * jwt:
     * - 初回ログイン時のみ user が渡される
     * - user.id を token に保存しておく
     */
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    /**
     * session:
     * - jwt に保存した userId を
     *   session.user.id として公開する
     * - アプリ内の認可判定はこれを使う
     * - emailVerified 状態も取得して含める
     */
    async session({ session, token }) {
      session.user.id = token.userId as string;

      // ユーザーのemailVerified状態をDBから取得
      if (token.userId) {
        const user = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { emailVerified: true },
        });
        // PrismaスキーマのBooleanをNextAuth期待のDate | null に変換
        session.user.emailVerified = user?.emailVerified ? new Date() : null;
      }

      return session;
    },
  },
});
