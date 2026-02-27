export function requireRole(roles) {
    return (req, res, next) => {
        const r = req.auth?.role;
        if (!r || !roles.includes(r)) {
            return res.status(403).json({ error: "FORBIDDEN", requiredRoles: roles, yourRole: r });
        }
        next();
    };
}
