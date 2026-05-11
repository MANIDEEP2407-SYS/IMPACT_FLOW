import { Router } from 'express';
import { createProject, getCourseProjects, getProject } from '../controllers/project.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.use(authMiddleware);

router.post('/courses/:courseId/projects', validateId, roleGuard('faculty'), createProject);
router.get('/courses/:courseId/projects', validateId, getCourseProjects);
router.get('/projects/:id', validateId, getProject);

export default router;
