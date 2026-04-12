import express from 'express';
import cookieParser from 'cookie-parser';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import resultsRoutes from './routes/results.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import adminRoutes from './routes/admin.routes.js';


const app = express();


app.use(express.json({
    limit: '10kb'
}));
app.use(cookieParser());

app.use('/auth', authRoutes);

app.use('/results', resultsRoutes);

app.use('/courses', coursesRoutes);

app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

//server port start on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});