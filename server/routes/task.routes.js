import { Router } from 'express';
import { createTask, getMyTasks, getTeamTasks } from '../controllers/task.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';
import { uploadTasks } from '../config/cloudinary.js';

const router = Router();

router.use(authMiddleware);

router.post('/', roleGuard('student'), uploadTasks.array('files', 3), createTask);
router.get('/my', getMyTasks);
router.get('/team/:teamId', validateId, getTeamTasks);

export default router;
