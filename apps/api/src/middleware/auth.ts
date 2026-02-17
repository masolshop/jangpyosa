import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthUser = { sub: string; role: string };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
      user?: { id: string; role: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "NO_TOKEN" });
  }
  const token = h.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.auth = decoded;
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "NO_AUTH" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
  };
}
