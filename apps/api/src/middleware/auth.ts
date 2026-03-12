import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthUser = { userId: string; role: string };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
      user?: { id: string; role: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log('[requireAuth] 요청 경로:', req.path);
  console.log('[requireAuth] Authorization 헤더:', req.headers.authorization?.substring(0, 30) + '...');
  
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    console.log('[requireAuth] ❌ NO_TOKEN - Authorization 헤더 없음 또는 형식 오류');
    return res.status(401).json({ error: "NO_TOKEN" });
  }
  const token = h.slice("Bearer ".length);
  console.log('[requireAuth] 토큰 길이:', token.length);
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    console.log('[requireAuth] ✅ 토큰 검증 성공 - userId:', decoded.userId, 'role:', decoded.role);
    req.auth = decoded;
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error: any) {
    console.log('[requireAuth] ❌ INVALID_TOKEN - 토큰 검증 실패:', error.message);
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
