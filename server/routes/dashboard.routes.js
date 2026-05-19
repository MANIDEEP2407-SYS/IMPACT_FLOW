import { Router } from 'express';
import { getProjectDashboard, getProjectOverview } from '../controllers/dashboard.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/projects/:projectId/dashboard', authMiddleware, validateId, roleGuard('faculty'), getProjectDashboard);
router.get('/projects/:projectId/overview', authMiddleware, validateId, getProjectOverview);

export default router;
