import { Router } from 'express';
import {
  sendInvite, acceptInvite, rejectInvite,
  getMyInvites, getTeamInvites, getEligibleStudents,
} from '../controllers/invite.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId }                from '../middleware/validateId.js';

const router = Router();
router.use(authMiddleware);

/* Invite CRUD */
router.post('/teams/:teamId/invite',              validateId, roleGuard('student'), sendInvite);
router.get('/teams/:teamId/invites',              validateId, roleGuard('student'), getTeamInvites);
router.put('/invites/:inviteId/accept',           validateId, roleGuard('student'), acceptInvite);
router.put('/invites/:inviteId/reject',           validateId, roleGuard('student'), rejectInvite);
router.get('/invites/my',                         roleGuard('student'), getMyInvites);

/* Eligible students search (for invite autocomplete) */
router.get('/projects/:projectId/eligible-students', validateId, getEligibleStudents);

export default router;
