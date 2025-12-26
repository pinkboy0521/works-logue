import "dotenv/config";
import { Pool } from "pg";

// PostgreSQL 接続プール
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "works_logue",
  user: process.env.DB_USER || "works_logue_app",
  password: process.env.DB_PASSWORD || "",
  // Cloud SQL Auth Proxy使用時の設定
  ssl: false, // プロキシ経由なのでSSL無効
  connectionTimeoutMillis: 10000,
  max: 10,
  idleTimeoutMillis: 30000,
});

// 接続確認用関数
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    client.release();

    console.log("✅ PostgreSQL 接続成功:", result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL 接続失敗:", error);
    return false;
  }
}

// アプリ終了時のクリーンアップ
process.on("SIGINT", async () => {
  console.log("\n🔄 PostgreSQL 接続プールをクローズします...");
  await pool.end();
  process.exit(0);
});
