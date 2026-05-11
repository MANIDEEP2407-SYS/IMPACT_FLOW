import { Router } from 'express';
import { createTeam, joinRequest, approveTeam, rejectTeam, getProjectTeams, removeMember } from '../controllers/team.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.use(authMiddleware);

router.post('/projects/:projectId/teams', validateId, roleGuard('student'), createTeam);
router.post('/teams/:teamId/join-request', validateId, roleGuard('student'), joinRequest);
router.put('/teams/:teamId/approve', validateId, roleGuard('faculty'), approveTeam);
router.put('/teams/:teamId/reject', validateId, roleGuard('faculty'), rejectTeam);
router.put('/teams/:teamId/remove-member', validateId, removeMember);
router.get('/projects/:projectId/teams', validateId, getProjectTeams);

export default router;
