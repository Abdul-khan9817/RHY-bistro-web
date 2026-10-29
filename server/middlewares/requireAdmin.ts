import type { Request, Response, NextFunction } from "express";
import { verifyToken, type AdminJwtPayload } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

// Augment Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.admin = payload;
    next();
  } catch (err) {
    logger.warn({ err }, "Invalid admin JWT");
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}
