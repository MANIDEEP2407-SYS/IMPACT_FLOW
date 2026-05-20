import { Router } from 'express';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import {
  getTeamContributionSummary,
  getContributionTimeline,
  getContributionHeatmap,
  getContributionDistribution,
  getWeightMatrix,
  getSuspiciousEvents,
  validateEvent,
} from '../controllers/contribution.controller.js';

const router = Router();

// Public — weight matrix visible to all (builds trust)
router.get('/contributions/weights', getWeightMatrix);

// Auth required
router.use(authMiddleware);

router.get('/teams/:teamId/contributions/summary',      getTeamContributionSummary);
router.get('/teams/:teamId/contributions/timeline',     getContributionTimeline);
router.get('/teams/:teamId/contributions/heatmap',      getContributionHeatmap);
router.get('/teams/:teamId/contributions/distribution', getContributionDistribution);

// Faculty only
router.get('/projects/:projectId/contributions/suspicious', roleGuard('faculty'), getSuspiciousEvents);
router.put('/contributions/:eventId/validate',              roleGuard('faculty'), validateEvent);

export default router;
