import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import prisma from './config/db';
import enquiriesRouter from './routes/enquiries';
import studentsRouter from './routes/students';
import documentsRouter from './routes/documents';
import feesRouter from './routes/fees';
import academicsRouter from './routes/academics';
import aiRouter from './routes/ai';
import placementsRouter from './routes/placements';
import programRouter, { campusRouter } from './routes/programs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Main enquiries API routes
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/analytics', (req, res, next) => {
  req.url = '/analytics';
  enquiriesRouter(req, res, next);
});
app.use('/api/students', studentsRouter);
app.use('/api/applications', studentsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/fees', feesRouter);
app.use('/api/attendance', academicsRouter);
app.use('/api/marks', academicsRouter);
app.use('/api/results', academicsRouter);
app.use('/api/academics', academicsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/placements', placementsRouter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Additional metadata APIs (campuses and programs) for frontend selections
app.use('/api/programs', programRouter);
app.use('/api/campuses', campusRouter);

// GET /health route
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Production: Serve React static files
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Course & Program Portal API is running. Switch to production or start the React dev server.');
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app, server };
