import { isValidObjectId } from 'mongoose';

export function validateId(req, res, next) {
  const id = req.params.id || req.params.courseId || req.params.projectId ||
    req.params.milestoneId || req.params.teamId;
  if (id && !isValidObjectId(id))
    return res.status(400).json({ error: 'Invalid ID format' });
  next();
}
