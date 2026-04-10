import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    req.userId = decoded.userId;

    return next();
  } catch (error) {
    logger.error("[AuthMiddleware] Error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export default authMiddleware;
