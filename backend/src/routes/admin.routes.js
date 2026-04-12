import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const BCRYPT_COST = 12;
const ALLOWED_ROLES = ['STUDENT', 'LECTURER', 'ADMIN'];


router.post('/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const { email, name, password, role } = req.body ?? {};

    // Validate input
    if (typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
            error: 'A valid email address is required'
        });
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long'
        });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            error: 'Name is required'
        });
    }

    if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({
            error: `Role must be one of: ${ALLOWED_ROLES.join(', ')}`
        });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return res.status(201).json({ user });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'A user with this email already exists'
            });
        }
        throw err;
    }
});


router.post('/courses', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const { code, title, lecturerId } = req.body ?? {};

    if (typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({
            error: 'Course code is required'
        });
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
            error: 'Course title is required'
        });
    }

    if (lecturerId !== undefined && lecturerId !== null) {
        if (!Number.isInteger(lecturerId) || lecturerId <= 0) {
            return res.status(400).json({
                error: 'lecturerId must be a positive integer'
            });
        }

        const lecturer = await prisma.user.findUnique({
            where: { id: lecturerId },
            select: { role: true },
        });

        if (!lecturer || lecturer.role !== 'LECTURER') {
            return res.status(400).json({
                error: 'No lecturer found with the specified lecturerId'
            });
        }
    }

    try {
        const course = await prisma.course.create({
            data: {
                code,
                title,
                lecturerId: lecturerId ?? null
            },
            select: {
                id: true,
                code: true,
                title: true,
                lecturerId: true,
                createdAt: true,
            },
        });

        return res.status(201).json({ course });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'A course with this code already exists'
            });
        }
        throw err;
    }
});


router.post('/courses/:courseId/lecturer', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
        return res.status(400).json({
            error: 'Invalid course ID'
        });
    }

    const { lecturerId } = req.body ?? {};
    if (!Number.isInteger(lecturerId) || lecturerId <= 0) {
        return res.status(400).json({
            error: 'lecturerId must be a positive integer'
        });
    }

    const [course, lecturer] = await Promise.all([
        prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true },
        }),
        prisma.user.findUnique({
            where: { id: lecturerId },
            select: { role: true },
        }),
    ]);

    if (!course) {
        return res.status(404).json({
            error: 'Course not found'
        });
    }

    if (!lecturer || lecturer.role !== 'LECTURER') {
        return res.status(400).json({
            error: 'No lecturer found with the specified lecturerId'
        });
    }

    const updated = await prisma.course.update({
        where: { id: courseId },
        data: { lecturerId },
        select: {
            id: true,
            code: true,
            title: true,
            lecturerId: true,
        },
    });

    return res.json({ course: updated });
});

router.post('/courses/:courseId/students', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
        return res.status(400).json({
            error: 'Invalid course ID'
        });
    }

    const { studentId } = req.body ?? {};
    if (!Number.isInteger(studentId) || studentId <= 0) {
        return res.status(400).json({
            error: 'studentId must be a positive integer'
        });
    }

    const [course, student] = await Promise.all([
        prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true },
        }),
        prisma.user.findUnique({
            where: { id: studentId },
            select: { role: true },
        }),
    ]);

    if (!course) {
        return res.status(404).json({
            error: 'Course not found'
        });
    }

    if (!student || student.role !== 'STUDENT') {
        return res.status(400).json({
            error: 'No student found with the specified studentId'
        });
    }

    try {
        const enrolment = await prisma.enrolment.create({
            data: {
                studentId,
                courseId,
            },
            select: {
                id: true,
                studentId: true,
                courseId: true,
                createdAt: true,
            },
        });
        return res.status(201).json({ enrolment });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'This student is already enrolled in the course'
            });
        }
        throw err;
    }
});

export default router;