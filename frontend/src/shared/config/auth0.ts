// v4では環境変数を自動的に読み取るため、設定は不要
// 必要に応じてカスタム設定を追加

export const AUTH0_CONFIG = {
  audience: process.env.AUTH0_AUDIENCE,
  scope: "openid profile email",
};
