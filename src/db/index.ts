// src/db/index.ts
import pg from "pg";
import { config } from "../config/index.js";

const { Pool } = pg;
export const pool = new Pool({ connectionString: config.databaseUrl });

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

// Verify connection on startup
pool
  .connect()
  .then((client) => {
    console.log("Database connected successfully");
    client.release();
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  });
