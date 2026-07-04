import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: "development" | "production" | "test";
  port: number;

  // Optional values with defaults
  host?: string | undefined;
  logLevel?: "error" | "warn" | "info" | "debug" | undefined;
  dbUrl?: string | undefined;
  dbPool?: number | undefined;
  jwtSecret?: string | undefined;
  corsOrigin?: string | undefined;
  requestTimeout?: number | undefined;
}

const config: Config = {
  // Required values
  nodeEnv:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // Optional values - will be undefined if not set
  host: process.env.HOST,
  logLevel:
    (process.env.LOG_LEVEL as "error" | "warn" | "info" | "debug") || "info",
  dbUrl: process.env.DATABASE_URL,
  dbPool: process.env.DB_POOL ? parseInt(process.env.DB_POOL, 10) : undefined,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
  requestTimeout: process.env.REQUEST_TIMEOUT
    ? parseInt(process.env.REQUEST_TIMEOUT, 10)
    : 30000,
};

function validateConfig(): void {
  const errors: string[] = [];

  if (!config.port || isNaN(config.port)) {
    errors.push("PORT must be a valid number");
  }

  if (config.dbPool && isNaN(config.dbPool)) {
    errors.push("DB_POOL must be a valid number");
  }

  if (errors.length > 0) {
    console.error("Configuration validation failed:");
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}

validateConfig();

export default config;
