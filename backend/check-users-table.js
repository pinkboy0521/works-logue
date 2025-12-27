// check-users-table.js
import "dotenv/config";
import { pool } from "./src/lib/db.js";

async function checkUsersTable() {
  try {
    console.log("📋 Checking users table...");

    // テーブル存在確認
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      )
    `);

    console.log("✅ Users table exists:", tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      // テーブル構造確認
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      console.log("\n🏗️ Users table structure:");
      columns.rows.forEach((row) => {
        console.log(
          `  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
        );
      });

      // レコード数確認
      const count = await pool.query("SELECT COUNT(*) as count FROM users");
      console.log(`\n📊 Users count: ${count.rows[0].count}`);
    }
  } catch (error) {
    console.error("❌ Check failed:", error);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
