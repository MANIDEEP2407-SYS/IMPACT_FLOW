import { Router } from 'express';
import { submitMilestone, getMilestoneSubmission, getProjectSubmissions } from '../controllers/submission.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';
import { uploadSubmissions } from '../config/cloudinary.js';

const router = Router();

router.use(authMiddleware);

router.post('/milestones/:milestoneId/submit', validateId, roleGuard('student'), uploadSubmissions.array('files', 10), submitMilestone);
router.get('/milestones/:milestoneId/submission', validateId, getMilestoneSubmission);
router.get('/projects/:projectId/submissions', validateId, roleGuard('faculty'), getProjectSubmissions);

export default router;
