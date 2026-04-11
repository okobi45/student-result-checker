import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get('/mine', requireAuth, requireRole('LECTURER'), async (req, res) => {
    const courses = await prisma.course.findMany({
        where: { lecturerId: req.user.id },
        select: {
            id: true,
            code: true,
            title: true,
            _count: {
                select: { enrolments: true },
            },
        },
        orderBy: { code: 'asc' },
    });
    return res.json({ courses });
});

router.get('/:courseId/results', requireAuth, requireRole('LECTURER'), async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
        return res.status(400).json({
            error: 'Invalid course ID'
        });
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            code: true,
            title: true,
            lecturerId: true
        },
    });

    if (!course || course.lecturerId !== req.user.id) {
        return res.status(403).json({
            error: 'Forbidden: you do not have access to this course'
        });
    }

    const enrolments = await prisma.enrolment.findMany({
        where: { courseId },
        select: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { student: { name: 'asc' } },
    });


    const results = await prisma.result.findMany({
        where: { courseId },
        select: {
            id: true,
            grade: true,
            studentId: true,
            updatedAt: true,
        },
    });


    const resultsByStudentId = Object.fromEntries(results.map(result => [result.studentId, result]));

    const studentsWithResults = enrolments.map((e) => ({
        student: e.student,
        result: resultsByStudentId[e.student.id] ?? null,
    }));

    return res.json({
        course: {
            id: course.id,
            code: course.code,
            title: course.title,
        },
        students: studentsWithResults,
    });
});

router.post('/:courseId/results', requireAuth, requireRole('LECTURER'), async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
        return res.status(400).json({
            error: 'Invalid course ID'
        });
    }

    const { studentId, grade } = req.body ?? {};
    if (!Number.isInteger(studentId) || studentId <= 0) {
        return res.status(400).json({
            error: 'student ID must be a positive integer. '
        });
    }
    if (!Number.isInteger(grade) || grade < 0 || grade > 100) {
        return res.status(400).json({
            error: 'grade must be an integer between 0 and 100'
        });
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            lecturerId: true
        },
    });
    if (!course || course.lecturerId !== req.user.id) {
        return res.status(403).json({
            error: 'Forbidden: you do not have access to this course'
        });
    }

    const enrolment = await prisma.enrolment.findUnique({
        where: {
            studentId_courseId: {
                studentId,
                courseId,
            },
        },
    });
    if (!enrolment) {
        return res.status(400).json({
            error: 'The specified student is not enrolled in this course'
        });
    }

    try {
        const result = await prisma.result.create({
            data: {
                studentId,
                courseId,
                grade,
            },
            select: {
                id: true,
                grade: true,
                studentId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return res.status(201).json({ result });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'This student already has a result in this course. Use PUT to update the existing result.'
            });
        }
        throw err;
    }
});

export default router; 