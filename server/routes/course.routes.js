import { Router } from 'express';
import { createCourse, getMyCourses, joinCourse, getEnrolledCourses } from '../controllers/course.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', roleGuard('faculty'), createCourse);
router.get('/my', roleGuard('faculty'), getMyCourses);
router.get('/enrolled', roleGuard('student'), getEnrolledCourses);
router.post('/:id/join', roleGuard('student'), joinCourse);

export default router;
