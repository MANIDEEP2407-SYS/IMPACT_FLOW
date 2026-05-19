import { Router } from 'express';
import { getProfile, updateProfile, getUserById, getUserProfile, getAdminDashboard } from '../controllers/user.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.use(authMiddleware);

router.get('/user/profile', getProfile);
router.put('/user/profile', updateProfile);
router.get('/users/:userId/profile', validateId, getUserProfile);
router.get('/users/:userId', validateId, getUserById);
router.get('/admin/dashboard', roleGuard('admin'), getAdminDashboard);

export default router;
