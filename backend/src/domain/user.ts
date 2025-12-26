// ユーザーエンティティ（DBからの取得用）
export interface User {
  id: string; // UUID
  external_subject: string; // Auth0のsub
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Auth0 JWT ペイロードの型
export interface Auth0JwtPayload {
  sub: string; // 外部ID
  email: string;
  name: string;
  iss: string;
  aud: string[];
  iat: number;
  exp: number;
}

// ユーザー作成用入力データ
export interface CreateUserInput {
  external_subject: string;
  email: string;
  name: string;
}

// APIレスポンス用（/me エンドポイント）
export interface UserResponse {
  id: string;
  email: string;
  name: string;
}
