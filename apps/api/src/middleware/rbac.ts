import { Request, Response, NextFunction } from "express";

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = req.auth?.role;
    if (!r || !roles.includes(r)) {
      return res.status(403).json({ error: "FORBIDDEN", requiredRoles: roles, yourRole: r });
    }
    next();
  };
}
