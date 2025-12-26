import "dotenv/config"; // .envファイルを読み取る
import { Client } from "pg";

// テスト用接続関数
async function testDirectConnection() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "works_logue",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD, // .envから読み取った値を使用
  });

  try {
    console.log("接続テスト開始...");
    await client.connect();
    console.log("✅ 接続成功!");

    const result = await client.query("SELECT NOW() as current_time");
    console.log("🕒 現在時刻:", result.rows[0].current_time);

    await client.end();
    console.log("✅ 接続終了");
  } catch (error) {
    console.error("❌ 接続エラー:", error.message);
    console.error("エラー詳細:", error);
  }
}

testDirectConnection();
