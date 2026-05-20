import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  linkGitHub,
  getGitHubLink,
  syncGitHub,
  getTeamGitHubLinks,
} from '../controllers/github.controller.js';

const router = Router();
router.use(authMiddleware);

router.post('/projects/:projectId/github-link',       linkGitHub);
router.get ('/projects/:projectId/github-link',       getGitHubLink);
router.post('/projects/:projectId/github-sync',       syncGitHub);
router.get ('/projects/:projectId/github-links/team', getTeamGitHubLinks);

export default router;
