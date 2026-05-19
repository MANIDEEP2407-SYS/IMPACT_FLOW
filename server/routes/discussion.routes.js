import { Router } from 'express';
import {
  getDiscussions, createDiscussion, addReply, togglePin, deleteDiscussion,
} from '../controllers/discussion.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateId }      from '../middleware/validateId.js';

const router = Router();
router.use(authMiddleware);

/* Team-scoped discussions */
router.get('/teams/:teamId/discussions',           validateId, getDiscussions);
router.post('/teams/:teamId/discussions',          validateId, createDiscussion);

/* Single discussion actions */
router.post('/discussions/:discussionId/replies',  validateId, addReply);
router.put('/discussions/:discussionId/pin',       validateId, togglePin);
router.delete('/discussions/:discussionId',        validateId, deleteDiscussion);

export default router;
