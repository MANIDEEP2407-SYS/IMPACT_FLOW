import { z } from 'zod';
import Discussion from '../models/Discussion.js';
import Team       from '../models/Team.js';
import { idsEqual } from '../utils/access.js';

const threadSchema = z.object({
  title:   z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

const replySchema = z.object({
  content: z.string().min(1).max(3000),
});

/* Check if user is a team member or faculty */
async function canAccessTeam(teamId, user) {
  const team = await Team.findById(teamId).populate('course', 'faculty');
  if (!team) return null;
  const isMember = team.members.some(m => idsEqual(m.user, user._id));
  const isFaculty = user.role === 'faculty' && idsEqual(team.course?.faculty, user._id);
  return (isMember || isFaculty) ? team : null;
}

/* GET /api/teams/:teamId/discussions */
export async function getDiscussions(req, res, next) {
  try {
    const team = await canAccessTeam(req.params.teamId, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const discussions = await Discussion.find({ team: req.params.teamId })
      .populate('author', 'name email rollNo')
      .populate('replies.author', 'name email rollNo')
      .sort({ pinned: -1, createdAt: -1 });

    res.json({ discussions });
  } catch (err) { next(err); }
}

/* POST /api/teams/:teamId/discussions */
export async function createDiscussion(req, res, next) {
  try {
    const team = await canAccessTeam(req.params.teamId, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const { title, content } = threadSchema.parse(req.body);

    const discussion = await Discussion.create({
      team:   req.params.teamId,
      author: req.user._id,
      title,
      content,
    });

    const populated = await Discussion.findById(discussion._id)
      .populate('author', 'name email rollNo');

    res.status(201).json({ discussion: populated });
  } catch (err) { next(err); }
}

/* POST /api/discussions/:discussionId/replies */
export async function addReply(req, res, next) {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const team = await canAccessTeam(discussion.team, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const { content } = replySchema.parse(req.body);

    discussion.replies.push({ author: req.user._id, content });
    await discussion.save();

    const populated = await Discussion.findById(discussion._id)
      .populate('author', 'name email rollNo')
      .populate('replies.author', 'name email rollNo');

    res.json({ discussion: populated });
  } catch (err) { next(err); }
}

/* PUT /api/discussions/:discussionId/pin  — toggle pin (team lead or faculty) */
export async function togglePin(req, res, next) {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const team = await Team.findById(discussion.team).populate('course', 'faculty');
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const isLead    = idsEqual(team.teamLead, req.user._id);
    const isFaculty = req.user.role === 'faculty' && idsEqual(team.course?.faculty, req.user._id);
    if (!isLead && !isFaculty)
      return res.status(403).json({ error: 'Only team lead or faculty can pin discussions' });

    discussion.pinned = !discussion.pinned;
    await discussion.save();

    res.json({ discussion });
  } catch (err) { next(err); }
}

/* DELETE /api/discussions/:discussionId  — author, lead, or faculty */
export async function deleteDiscussion(req, res, next) {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const team = await Team.findById(discussion.team).populate('course', 'faculty');
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const isAuthor  = idsEqual(discussion.author, req.user._id);
    const isLead    = idsEqual(team.teamLead, req.user._id);
    const isFaculty = req.user.role === 'faculty' && idsEqual(team.course?.faculty, req.user._id);
    if (!isAuthor && !isLead && !isFaculty)
      return res.status(403).json({ error: 'Not authorized to delete' });

    await Discussion.findByIdAndDelete(discussion._id);
    res.json({ deleted: true });
  } catch (err) { next(err); }
}
