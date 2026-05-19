import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS — local DNS doesn't resolve MongoDB SRV records
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import projectRoutes from './routes/project.routes.js';
import milestoneRoutes from './routes/milestone.routes.js';
import teamRoutes from './routes/team.routes.js';
import taskRoutes from './routes/task.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';
import discussionRoutes from './routes/discussion.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startCronJobs } from './utils/cronJobs.js';

const app = express();

app.use(helmet());

/* ── Hardened CORS: support dev + production origins ── */
const defaultAllowedOrigins = [
  'http://localhost:5174',                          // Vite dev (default)
  'http://localhost:5173',                          // Vite default port
  'http://localhost:3000',                          // Alternative dev port
  'http://127.0.0.1:5174',                          // Localhost alt
  'http://127.0.0.1:5173',                          // Localhost alt
  'https://impact-flow-frontend.onrender.com',      // Render production
];

const envAllowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 10000,
}));
app.use(express.json());
app.use(cookieParser());

/* ── Health check endpoint ── */
app.get('/health', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const cloudinaryStatus = process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'missing';
    
    const health = {
      status: mongoStatus === 'connected' && cloudinaryStatus === 'configured' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: mongoStatus,
      cloudinary: cloudinaryStatus,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
    
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', projectRoutes);
app.use('/api', milestoneRoutes);
app.use('/api', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', submissionRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', userRoutes);
app.use('/api', discussionRoutes);
app.use('/api', inviteRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  configureCloudinary();
  startCronJobs();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
