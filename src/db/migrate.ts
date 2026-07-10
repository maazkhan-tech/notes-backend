// src/db/migrate.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // Ensure the migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of already-applied migrations
    const applied = await client.query<{ filename: string }>(
      "SELECT filename FROM migrations ORDER BY filename",
    );
    const appliedSet = new Set(applied.rows.map((r) => r.filename));

    // Read all .sql files from the migrations directory
    const migrationsDir = path.join(__dirname, "../../migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort(); // alphabetical = chronological with numbered filenames

    let applied_count = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ✓ ${file} (already applied)`);
        continue;
      }

      console.log(`  → Applying ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      // Run each migration in its own transaction
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        console.log(`  ✓ ${file} applied`);
        applied_count++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }

    console.log(
      `\nMigrations complete. ${applied_count} new migration(s) applied.`,
    );
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err.message);
    pool.end();
    process.exit(1);
  });
