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



router.put('/:resultId', requireAuth, requireRole('LECTURER'), async (req, res) => {
    const resultId = parseInt(req.params.resultId, 10);
    if (Number.isNaN(resultId)) {
        return res.status(400).json({
            error: 'Invalid result ID'
        });
    }

    const { grade } = req.body ?? {};
    if (!Number.isInteger(grade) || grade < 0 || grade > 100) {
        return res.status(400).json({
            error: 'Invalid grade value: must be an integer between 0 and 100'
        });
    }

    const result = await prisma.result.findUnique({
        where: { id: resultId },
        select: {
            id: true,
            course: {
                select: {
                    lecturerId: true,
                },
            },
        },
    });
    if (!result || result.course.lecturerId !== req.user.id) {
        return res.status(403).json({
            error: 'you do not have permission to edit this result'
        });
    }

    const updated = await prisma.result.update({
        where: { id: resultId },
        data: { grade },
        select: {
            id: true,
            grade: true,
            studentId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return res.json({ result: updated });
});


router.delete('/:resultId', requireAuth, requireRole('LECTURER'), async (req, res) => {
    const resultId = parseInt(req.params.resultId, 10);
    if (Number.isNaN(resultId)) {
        return res.status(400).json({
            error: 'Invalid result ID'
        });
    }

    const result = await prisma.result.findUnique({
        where: { id: resultId },
        select: {
            id: true,
            course: {
                select: { lecturerId: true },
            },
        },
    });



    if (!result || result.course.lecturerId !== req.user.id) {
        return res.status(403).json({
            error: 'you do not have access to this result'
        });
    }

    await prisma.result.delete({
        where: { id: resultId },
    });

    return res.status(204).send();

});

export default router;