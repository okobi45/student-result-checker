import prisma from "../lib/prisma.js";
import { verifyToken, COOKIE_NAME } from "../lib/auth.js";

export async function requireAuth(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    try {
        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
}

export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden: insufficient permissions'
            });
        }

        return next();
    };
}