import { randomUUID } from "crypto";
import { pool } from "../lib/db.js";
import type { CreateUserInput, User } from "./user.js";

/**
 * external_subject で既存ユーザーを検索
 */
export async function findUserByExternalSubject(
  externalSubject: string
): Promise<User | null> {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE external_subject = $1",
      [externalSubject]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ ユーザー検索エラー:", error);
    throw new Error("ユーザー検索に失敗しました");
  }
}

/**
 * 新規ユーザーを作成
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const id = randomUUID();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO users (id, external_subject, email, name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, input.external_subject, input.email, input.name, now, now]
    );

    return result.rows[0];
  } catch (error) {
    console.error("❌ ユーザー作成エラー:", error);
    throw new Error("ユーザー作成に失敗しました");
  }
}

/**
 * ユーザーを自動作成（外部認証用）
 *
 * 1. existing_subject で検索
 * 2. なければ作成
 * 3. あれば既存を返す
 */
export async function findOrCreateUser(input: CreateUserInput): Promise<User> {
  console.log("🔍 ユーザー確定処理開始:", input.external_subject);

  // 既存ユーザーを検索
  const existingUser = await findUserByExternalSubject(input.external_subject);

  if (existingUser) {
    console.log("✅ 既存ユーザーを取得:", {
      id: existingUser.id,
      email: existingUser.email,
      external_subject: existingUser.external_subject,
    });
    return existingUser;
  }

  // 新規ユーザーを作成
  const newUser = await createUser(input);
  console.log("🆕 新規ユーザーを作成:", {
    id: newUser.id,
    email: newUser.email,
    external_subject: newUser.external_subject,
  });
  return newUser;
}
