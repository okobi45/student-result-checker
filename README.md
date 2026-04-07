# student-result-checker

A secure web application for managing and viewing student academic results. Developed as a final-year project with a focus on secure web application development practices.

## Overview

The application supports two user roles: students, who can view their own academic results, and lecturers, who can create, update, and delete results for the courses they teach. Security has been considered throughout every phase of the development lifecycle, from requirements and design to implementation and testing.

## Tech Stack

### Frontend
- React (with Vite)
- React Router
- React-Bootstrap
- Axios

### Backend
- Node.js
- Express
- Prisma ORM

### Database
- SQLite

### Security
- bcrypt for password hashing
- JWT authentication via HTTP-only cookies
- Helmet for secure HTTP headers
- CORS configured restrictively
- express-rate-limit for brute-force protection
- express-validator for server-side input validation
- CSRF protection
- Winston for audit logging

## Project Structure

\`\`\`
student-result-checker/
├── backend/      # Express API server
├── frontend/     # React + Vite client
└── docs/         # Documentation, diagrams, screenshots
\`\`\`

## Setup

Setup and installation instructions will be provided as the project structure is finalised.

## Security

A detailed list of implemented security features and the threats they mitigate can be found in the project report.

## License
