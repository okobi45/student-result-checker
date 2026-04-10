//login, logout authentication

import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { signToken, verifyToken, COOKIE_OPTIONS, COOKIE_NAME } from "../lib/auth.js";

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }


    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });

    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    };

    const token = signToken(user);

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    });

});

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.json({
        ok: true
    });
});


router.get('/me', async (req, res) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        return res.status(401).json({
            error: 'Not authenticated'
        });
    };

    try {
        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            },
        });

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        return res.json({ user });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export default router;