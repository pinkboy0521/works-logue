import "dotenv/config";
import { Pool } from "pg";

const isCloudRun = !!process.env.K_SERVICE;

// PostgreSQL 接続プール
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ...(isCloudRun
    ? {
        // Cloud Run / Cloud SQL
        host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
      }
    : {
        // ローカル開発
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 5432,
      }),

  ssl: false,
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
