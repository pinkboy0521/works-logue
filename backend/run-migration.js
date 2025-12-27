// backend/run-migration.js
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { Client } from "pg";

const client = new Client({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "works_logue",
});

async function runMigration() {
  try {
    await client.connect();
    console.log("✅ データベース接続成功");

    // マイグレーションファイルを読み込み
    const migrationPath = path.join(
      process.cwd(),
      "migrations",
      "001_create_articles.sql"
    );
    const migration = readFileSync(migrationPath, "utf8");

    // マイグレーションを実行
    await client.query(migration);
    console.log("✅ マイグレーション実行成功 - articlesテーブル作成完了");
  } catch (error) {
    console.error("❌ マイグレーション実行エラー:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
