import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: Number(optionalEnv("PORT", "3000")),
  noteFile: optionalEnv("NOTES_FILE", "notes.json"),
  // When you add these later, they'll be required:
  // jwtSecret: requireEnv('JWT_SECRET'),
  databaseUrl: requireEnv("DATABASE_URL"),
} as const;
export const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1); // crash immediately if DB is unreachable
  }
  console.log("Database connected");
  release();
});
