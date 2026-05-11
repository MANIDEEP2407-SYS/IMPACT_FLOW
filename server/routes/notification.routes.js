import { Router } from 'express';
import { getMyNotifications, markRead, markAllRead } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/my', getMyNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

export default router;
