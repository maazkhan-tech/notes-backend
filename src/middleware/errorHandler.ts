// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import pg from "pg";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message },
    });
    return;
  }

  // PostgreSQL errors have a 'code' property
  if (err instanceof pg.DatabaseError) {
    console.error("Database error:", err.message, "Code:", err.code);
    res.status(500).json({
      success: false,
      error: { message: "Database error" },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error" },
  });
}
