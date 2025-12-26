// backend/src/routes/debug.ts
import type { FastifyInstance } from "fastify";
import { pool } from "../lib/db.js";

export default async function debugRoute(fastify: FastifyInstance) {
  // データベース接続確認用エンドポイント（一時的）
  fastify.get("/debug/db", async (request, reply) => {
    try {
      console.log("🔍 データベース接続テスト開始");

      // 基本的な接続確認
      const basicTest = await pool.query("SELECT 1 as test");
      console.log("✅ SELECT 1 成功:", basicTest.rows[0]);

      // 現在時刻取得
      const timeTest = await pool.query("SELECT NOW() as current_time");
      console.log("✅ 現在時刻取得成功:", timeTest.rows[0]);

      // usersテーブル確認
      const userCount = await pool.query(
        "SELECT COUNT(*) as user_count FROM users"
      );
      console.log("✅ usersテーブル確認成功:", userCount.rows[0]);

      // 最新のユーザー取得
      const latestUser = await pool.query(`
        SELECT id, external_subject, email, name, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      return reply.send({
        status: "success",
        message: "データベース接続確認成功",
        tests: {
          basic_select: basicTest.rows[0],
          current_time: timeTest.rows[0],
          user_count: userCount.rows[0],
          latest_user: latestUser.rows[0] || null,
        },
        database_info: {
          host: process.env.DB_HOST || "localhost",
          database: process.env.DB_NAME || "works_logue",
          user: process.env.DB_USER || "works_logue_app",
        },
      });
    } catch (error) {
      console.error("❌ データベース接続エラー:", error);
      return reply.status(500).send({
        status: "error",
        message: "データベース接続に失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  });
}
