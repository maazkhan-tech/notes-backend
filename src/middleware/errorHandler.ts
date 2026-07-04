// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

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

  // Unexpected error — log it, don't leak internals to client
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error" },
  });
}
