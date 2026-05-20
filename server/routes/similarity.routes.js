import { Router } from 'express';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import {
  upsertREADMEMeta,
  getREADMEMeta,
  getCourseSimilarityMatrix,
  getProjectSimilarity,
  getValidDomains,
} from '../controllers/similarity.controller.js';

const router = Router();

// Public — valid domain list
router.get('/readme-meta/domains', getValidDomains);

router.use(authMiddleware);

router.post('/projects/:projectId/readme-meta',      upsertREADMEMeta);
router.get ('/projects/:projectId/readme-meta',      getREADMEMeta);
router.get ('/projects/:projectId/similarity',       roleGuard('faculty'), getProjectSimilarity);
router.get ('/courses/:courseId/similarity',         roleGuard('faculty'), getCourseSimilarityMatrix);

export default router;
