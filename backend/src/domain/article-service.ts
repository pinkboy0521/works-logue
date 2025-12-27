// backend/src/domain/article-service.ts
import { randomUUID } from "crypto";
import { pool } from "../lib/db.js";
import type {
  Article,
  CreateArticleInput,
  UpdateArticleInput,
} from "./article.js";

/**
 * 記事を作成（draft状態で作成）
 */
export async function createArticle(
  input: CreateArticleInput
): Promise<Article> {
  try {
    const id = randomUUID();
    const now = new Date();

    const content = input.content || "";

    console.log("🔍 Debug - Creating article with data:", {
      id,
      title: input.title,
      content: content.length + " chars",
      author_id: input.author_id,
      author_id_type: typeof input.author_id,
    });

    const result = await pool.query(
      `INSERT INTO articles (id, title, content, body_markdown, status, author_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7)
       RETURNING *`,
      [id, input.title, content, content, input.author_id, now, now]
    );

    console.log("✅ Debug - Article created successfully");
    return result.rows[0];
  } catch (error) {
    console.error("❌ 記事作成エラー:", error);
    console.error("❌ エラー詳細:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      constraint: (error as any)?.constraint,
    });
    throw new Error(
      `記事作成に失敗しました: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * 記事を更新（author本人のみ）
 */
export async function updateArticle(
  articleId: string,
  authorId: string,
  input: UpdateArticleInput
): Promise<Article | null> {
  try {
    // 更新対象のフィールドを動的に構築
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(input.title);
      paramIndex++;
    }

    if (input.content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(input.content);
      paramIndex++;

      // body_markdownも同じ内容で更新
      updates.push(`body_markdown = $${paramIndex}`);
      values.push(input.content);
      paramIndex++;
    }

    if (updates.length === 0) {
      // 更新対象がない場合は既存の記事を返す
      return await findArticleById(articleId, authorId);
    }

    // updated_atを更新
    updates.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    // WHERE条件用のパラメータ
    values.push(articleId, authorId);

    const query = `
      UPDATE articles 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex} AND author_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ 記事更新エラー:", error);
    throw new Error("記事更新に失敗しました");
  }
}

/**
 * 記事を公開（author本人のみ）
 */
export async function publishArticle(
  articleId: string,
  authorId: string
): Promise<Article | null> {
  try {
    const now = new Date();

    const result = await pool.query(
      `UPDATE articles 
       SET status = 'published', published_at = $1, updated_at = $1
       WHERE id = $2 AND author_id = $3
       RETURNING *`,
      [now, articleId, authorId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ 記事公開エラー:", error);
    throw new Error("記事公開に失敗しました");
  }
}

/**
 * IDで記事を取得（author本人のみ）
 */
export async function findArticleById(
  articleId: string,
  authorId: string
): Promise<Article | null> {
  try {
    const result = await pool.query(
      "SELECT * FROM articles WHERE id = $1 AND author_id = $2",
      [articleId, authorId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ 記事取得エラー:", error);
    throw new Error("記事取得に失敗しました");
  }
}

/**
 * ユーザーの記事一覧を取得
 */
export async function findArticlesByAuthor(
  authorId: string
): Promise<Article[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM articles 
       WHERE author_id = $1 
       ORDER BY updated_at DESC`,
      [authorId]
    );

    return result.rows;
  } catch (error) {
    console.error("❌ 記事一覧取得エラー:", error);
    throw new Error("記事一覧取得に失敗しました");
  }
}
