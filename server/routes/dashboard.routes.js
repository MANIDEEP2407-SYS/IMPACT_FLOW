import { Router } from 'express';
import { getProjectDashboard } from '../controllers/dashboard.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/projects/:projectId/dashboard', authMiddleware, validateId, roleGuard('faculty'), getProjectDashboard);

export default router;
