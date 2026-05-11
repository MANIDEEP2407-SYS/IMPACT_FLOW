import { Router } from 'express';
import { createMilestone, getMilestones, updateMilestone } from '../controllers/milestone.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.use(authMiddleware);

router.post('/projects/:projectId/milestones', validateId, roleGuard('faculty'), createMilestone);
router.get('/projects/:projectId/milestones', validateId, getMilestones);
router.put('/milestones/:id', validateId, roleGuard('faculty'), updateMilestone);

export default router;
