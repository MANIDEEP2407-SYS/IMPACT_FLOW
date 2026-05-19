import { Router } from 'express';
import multer      from 'multer';
import {
  createTeam, joinRequest, approveTeam, rejectTeam,
  getProjectTeams, removeMember,
  getWorkspace, generateRandomTeams, approveAllAutoTeams, getSimilarityReport,
} from '../controllers/team.controller.js';
import { getReadme, saveReadme }   from '../controllers/readme.controller.js';
import { getFiles, uploadFiles }   from '../controllers/codefile.controller.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import { validateId }               from '../middleware/validateId.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

/* ── existing team routes ── */
router.post('/projects/:projectId/teams',       validateId, roleGuard('student'), createTeam);
router.post('/teams/:teamId/join-request',      validateId, roleGuard('student'), joinRequest);
router.put('/teams/:teamId/approve',            validateId, roleGuard('faculty'), approveTeam);
router.put('/teams/:teamId/reject',             validateId, roleGuard('faculty'), rejectTeam);
router.put('/teams/:teamId/remove-member',      validateId, removeMember);
router.get('/projects/:projectId/teams',        validateId, getProjectTeams);

/* ── workspace ── */
router.get('/teams/:teamId/workspace',          validateId, getWorkspace);

/* ── README versioning ── */
router.get('/teams/:teamId/readme',             validateId, getReadme);
router.post('/teams/:teamId/readme',            validateId, roleGuard('student'), saveReadme);

/* ── code files ── */
router.get('/teams/:teamId/files',              validateId, getFiles);
router.post('/teams/:teamId/files',             validateId, roleGuard('student'), upload.array('files', 10), uploadFiles);

/* ── auto-form teams (faculty) ── */
router.post('/projects/:projectId/auto-form-teams', validateId, roleGuard('faculty'), generateRandomTeams);
router.put('/projects/:projectId/auto-form-teams/approve-all', validateId, roleGuard('faculty'), approveAllAutoTeams);
/* Backward compatibility */
router.post('/projects/:projectId/random-teams', validateId, roleGuard('faculty'), generateRandomTeams);

/* ── similarity report (faculty) ── */
router.get('/projects/:projectId/similarity',    validateId, roleGuard('faculty'), getSimilarityReport);

export default router;
