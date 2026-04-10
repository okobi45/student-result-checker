//prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

//slow brute-force resistant hashing for demo purposes
const BCRYPT_COST = 12;

//This is for shared dev purpose 
//In production i'll set all users to have their own password
const DEMO_PASSWORD = 'Password123!';

async function main() {
    console.log('Seeding database...');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_COST);


    await prisma.result.deleteMany();
    await prisma.enrolment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleared existing data.');


    const admin = await prisma.user.create({
        data: {
            email: 'admin@uni.ie',
            passwordHash,
            name: 'System Administrator',
            role: 'ADMIN',
        },
    });

    const lecturerSera = await prisma.user.create({
        data: {
            email: 'sera@uni.ie',
            passwordHash,
            name: 'Sera Johnson',
            role: 'LECTURER',
        },
    });

    const lecturerPratik = await prisma.user.create({
        data: {
            email: 'pratik@uni.ie',
            passwordHash,
            name: 'Pratik Patel',
            role: 'LECTURER',
        },
    });


    const students = await Promise.all([
        prisma.user.create({
            data: { email: 'peter@uni.ie', passwordHash, name: 'Peter Parker', role: 'STUDENT' },
        }),

        prisma.user.create({
            data: { email: 'abdul@uni.ie', passwordHash, name: 'Abdul Ibrahim', role: 'STUDENT' },
        }),

        prisma.user.create({
            data: { email: 'mildred@uni.ie', passwordHash, name: 'Mildred CYRIL', role: 'STUDENT' },
        }),

        prisma.user.create({
            data: { email: 'alex@uni.ie', passwordHash, name: 'Alex Harper', role: 'STUDENT' },
        }),

        prisma.user.create({
            data: { email: 'susan@uni.ie', passwordHash, name: 'Susan Walsh', role: 'STUDENT' },
        }),

        prisma.user.create({
            data: { email: 'eva@uni.ie', passwordHash, name: 'Eva Eigbe', role: 'STUDENT' },
        }),
    ]);
    console.log('Created users: admin, lecturers, students.');


    const softwareEng = await prisma.course.create({
        data: {
            code: 'CSC401',
            title: 'Software Engineering',
            lecturerId: lecturerSera.id,
        },
    });

    const databaseSys = await prisma.course.create({
        data: {
            code: 'CSC402',
            title: 'Database Systems',
            lecturerId: lecturerPratik.id,
        },
    });

    const operatingSys = await prisma.course.create({
        data: {
            code: 'CSC403',
            title: 'Operating Systems',
            lecturerId: lecturerSera.id,
        },
    });
    console.log('Created courses: Software Engineering, Databases Systems, Operating Systems.');

    //Erolments for students
    const enrolments = [
        { studentId: students[0].id, courseId: softwareEng.id },
        { studentId: students[0].id, courseId: databaseSys.id },
        { studentId: students[0].id, courseId: operatingSys.id },
        { studentId: students[1].id, courseId: softwareEng.id },
        { studentId: students[1].id, courseId: databaseSys.id },
        { studentId: students[1].id, courseId: operatingSys.id },
        { studentId: students[2].id, courseId: softwareEng.id },
        { studentId: students[3].id, courseId: databaseSys.id },
        { studentId: students[3].id, courseId: operatingSys.id },
        { studentId: students[4].id, courseId: softwareEng.id },
        { studentId: students[5].id, courseId: databaseSys.id },
    ];
    await prisma.enrolment.createMany({ data: enrolments, });
    console.log(`Created ${enrolments.length} enrolments.`);

    //Results for some enroled students
    const results = [
        { studentId: students[0].id, courseId: softwareEng.id, grade: 85 },
        { studentId: students[0].id, courseId: databaseSys.id, grade: 78 },
        { studentId: students[0].id, courseId: operatingSys.id, grade: 92 },
        { studentId: students[1].id, courseId: softwareEng.id, grade: 80 },
        { studentId: students[1].id, courseId: databaseSys.id, grade: 75 },
        { studentId: students[2].id, courseId: softwareEng.id, grade: 87 },

    ];
    await prisma.result.createMany({ data: results, });
    console.log(`Created ${results.length} results.`);

    console.log('\nSeeding completed successfully!');
    console.log(`Demo pasword: ${DEMO_PASSWORD}\n`);
}

main()
    .catch((e) => {
        console.error('Seed failed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


