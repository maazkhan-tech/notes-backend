// config/index.ts — clean version
import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: Number(optionalEnv("PORT", "3000")),
  databaseUrl: requireEnv("DATABASE_URL"),
} as const;
