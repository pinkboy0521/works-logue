/**
 * アプリケーション全体の設定
 */

export const appConfig = {
  name: "Works Logue",
  description: "記事投稿・管理プラットフォーム",
  version: "1.0.0",
  author: "pinkboy0521",

  // ページネーション設定
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50,
  },

  // UI設定
  ui: {
    defaultTheme: "light" as const,
    supportedThemes: ["light", "dark"] as const,
  },

  // 機能フラグ
  features: {
    darkMode: true,
    articleEditor: true,
    userProfiles: true,
  },
} as const;

export type AppConfig = typeof appConfig;
