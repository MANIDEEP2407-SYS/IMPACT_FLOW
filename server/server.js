import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS — local DNS doesn't resolve MongoDB SRV records
import express from 'express';
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
import { errorHandler } from './middleware/errorHandler.js';
import { startCronJobs } from './utils/cronJobs.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 10000,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', projectRoutes);
app.use('/api', milestoneRoutes);
app.use('/api', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', submissionRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  configureCloudinary();
  startCronJobs();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
