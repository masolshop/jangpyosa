import jwt from "jsonwebtoken";
import { config } from "../config.js";
export function requireAuth(req, res, next) {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "NO_TOKEN" });
    }
    const token = h.slice("Bearer ".length);
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.auth = decoded;
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "INVALID_TOKEN" });
    }
}
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "NO_AUTH" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "FORBIDDEN" });
        }
        next();
    };
}
