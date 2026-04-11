import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get('/mine', requireAuth, requireRole('STUDENT'), async (req, res) => {
    const results = await prisma.result.findMany({
        where: { studentId: req.user.id },
        select: {
            id: true,
            grade: true,
            createdAt: true,
            updatedAt: true,
            course: {
                select: {
                    id: true,
                    code: true,
                    title: true,
                    lecturer: {
                        select: {
                            id: true,
                            name: true
                        },
                    },
                },
            },
        },
        orderBy: { course: { code: 'asc' } },
    });
    return res.json({ results });
});

export default router;