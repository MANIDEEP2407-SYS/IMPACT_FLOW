import ContributionEvent from '../models/ContributionEvent.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import Course from '../models/Course.js';
import { idsEqual } from '../utils/access.js';
import { SCORE_WEIGHTS, SOURCE_CATEGORIES, CATEGORY_LABELS } from '../utils/scoreWeights.js';

/* ─── Helpers ─── */

async function assertTeamAccess(teamId, user) {
  const team = await Team.findById(teamId).populate({ path: 'project', populate: { path: 'course' } });
  if (!team) return null;
  const isMember  = team.members.some(m => idsEqual(m.user, user._id));
  const isFaculty = user.role === 'faculty' && idsEqual(team.project?.course?.faculty, user._id);
  return (isMember || isFaculty) ? team : null;
}

async function assertProjectAccess(projectId, user) {
  const project = await Project.findById(projectId).populate('course');
  if (!project) return null;
  if (user.role === 'faculty') {
    return idsEqual(project.course?.faculty, user._id) ? project : null;
  }
  const team = await Team.findOne({ project: projectId, 'members.user': user._id });
  return team ? project : null;
}

/* ─── GET /api/teams/:teamId/contributions/summary ─── */
/* Returns per-member aggregated scores + breakdown */
export async function getTeamContributionSummary(req, res, next) {
  try {
    const team = await assertTeamAccess(req.params.teamId, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const events = await ContributionEvent.find({
      teamId: team._id,
      validationState: { $ne: 'invalid' },
    }).lean();

    const memberIds = team.members.map(m => String(m.user));

    const summary = memberIds.map(uid => {
      const memberEvents = events.filter(e => String(e.userId) === uid);

      // Category breakdown
      const breakdown = {};
      for (const [cat, types] of Object.entries(SOURCE_CATEGORIES)) {
        const catScore = memberEvents
          .filter(e => types.includes(e.eventType))
          .reduce((s, e) => s + e.finalScore, 0);
        breakdown[cat] = { score: Math.round(catScore * 10) / 10, label: CATEGORY_LABELS[cat] };
      }

      const totalScore = memberEvents.reduce((s, e) => s + e.finalScore, 0);
      const suspiciousCount = memberEvents.filter(e => e.isSuspicious).length;
      const eventCount = memberEvents.length;

      return {
        userId: uid,
        totalScore: Math.round(totalScore * 10) / 10,
        eventCount,
        suspiciousCount,
        breakdown,
      };
    });

    res.json({ summary, teamId: team._id });
  } catch (err) { next(err); }
}

/* ─── GET /api/teams/:teamId/contributions/timeline ─── */
/* Human-readable activity feed */
export async function getContributionTimeline(req, res, next) {
  try {
    const team = await assertTeamAccess(req.params.teamId, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const userId = req.query.userId; // optional filter by member

    const query = { teamId: team._id };
    if (userId) query.userId = userId;

    const events = await ContributionEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name rollNo')
      .lean();

    const timeline = events.map(e => ({
      _id: e._id,
      user: e.userId,
      eventType: e.eventType,
      sourceType: e.sourceType,
      finalScore: e.finalScore,
      qualityLevel: e.qualityLevel,
      validationState: e.validationState,
      isSuspicious: e.isSuspicious,
      suspicionReason: e.suspicionReason,
      description: e.metadata?.description || humanise(e.eventType),
      createdAt: e.createdAt,
    }));

    res.json({ timeline });
  } catch (err) { next(err); }
}

/* ─── GET /api/teams/:teamId/contributions/heatmap ─── */
/* Daily activity counts per member for last 30 days */
export async function getContributionHeatmap(req, res, next) {
  try {
    const team = await assertTeamAccess(req.params.teamId, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const days = Math.min(Number(req.query.days) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await ContributionEvent.find({
      teamId: team._id,
      createdAt: { $gte: since },
      validationState: { $ne: 'invalid' },
    }).lean();

    const memberIds = team.members.map(m => String(m.user));

    // Build { userId → { 'YYYY-MM-DD' → score } }
    const heatmap = {};
    for (const uid of memberIds) {
      heatmap[uid] = {};
    }

    for (const e of events) {
      const uid = String(e.userId);
      if (!heatmap[uid]) continue;
      const day = e.createdAt.toISOString().split('T')[0];
      heatmap[uid][day] = (heatmap[uid][day] || 0) + e.finalScore;
    }

    res.json({ heatmap, days, memberIds });
  } catch (err) { next(err); }
}

/* ─── GET /api/teams/:teamId/contributions/distribution ─── */
/* Category % breakdown for the whole team or one member */
export async function getContributionDistribution(req, res, next) {
  try {
    const team = await assertTeamAccess(req.params.teamId, req.user);
    if (!team) return res.status(403).json({ error: 'Access denied' });

    const query = { teamId: team._id, validationState: { $ne: 'invalid' } };
    if (req.query.userId) query.userId = req.query.userId;

    const events = await ContributionEvent.find(query).lean();

    const dist = {};
    for (const [cat, types] of Object.entries(SOURCE_CATEGORIES)) {
      const score = events
        .filter(e => types.includes(e.eventType))
        .reduce((s, e) => s + e.finalScore, 0);
      dist[cat] = { score: Math.round(score * 10) / 10, label: CATEGORY_LABELS[cat] };
    }

    const total = Object.values(dist).reduce((s, d) => s + d.score, 0);
    for (const cat of Object.keys(dist)) {
      dist[cat].percentage = total > 0
        ? Math.round((dist[cat].score / total) * 100)
        : 0;
    }

    res.json({ distribution: dist, total: Math.round(total * 10) / 10 });
  } catch (err) { next(err); }
}

/* ─── GET /api/contributions/weights ─── */
/* Public weight matrix — no auth required */
export async function getWeightMatrix(req, res) {
  res.json({
    weights: SCORE_WEIGHTS,
    categories: CATEGORY_LABELS,
    qualityMultipliers: { low: 0.5, medium: 1.0, high: 1.5 },
    validationMultipliers: { verified: 1.0, suspicious: 0.5, invalid: 0 },
    formula: 'finalScore = baseScore × validationMultiplier × qualityMultiplier',
    antiSpamRules: [
      'Max 3 discussion replies per hour per member count towards score',
      'Duplicate file uploads (same hash) are ignored',
      'Tasks must have description ≥ 20 characters',
      'GitHub commits must have unique SHA per project',
      'Empty commits and merge-only commits are not counted',
    ],
  });
}

/* ─── GET /api/projects/:projectId/contributions/suspicious ─── */
/* Faculty only — list suspicious events for review */
export async function getSuspiciousEvents(req, res, next) {
  try {
    const project = await assertProjectAccess(req.params.projectId, req.user);
    if (!project) return res.status(403).json({ error: 'Access denied' });
    if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Faculty only' });

    const events = await ContributionEvent.find({
      projectId: req.params.projectId,
      isSuspicious: true,
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name rollNo email')
      .populate('teamId', 'name')
      .lean();

    res.json({ events });
  } catch (err) { next(err); }
}

/* ─── PUT /api/contributions/:eventId/validate ─── */
/* Faculty manually validates or invalidates a suspicious event */
export async function validateEvent(req, res, next) {
  try {
    if (req.user.role !== 'faculty') return res.status(403).json({ error: 'Faculty only' });
    const { state } = req.body; // 'verified' | 'invalid'
    if (!['verified', 'invalid'].includes(state))
      return res.status(400).json({ error: 'state must be verified or invalid' });

    const event = await ContributionEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.validationState = state;
    event.isSuspicious = false;
    event.validationMultiplier = state === 'verified' ? 1.0 : 0.0;
    event.finalScore = Math.round(
      event.baseScore * event.validationMultiplier * event.qualityMultiplier * 10
    ) / 10;
    await event.save();

    res.json({ event });
  } catch (err) { next(err); }
}

/* ─── Utility: human-readable event label ─── */
function humanise(eventType) {
  const map = {
    TASK_CREATED:          'Created a task',
    TASK_COMPLETED:        'Completed a task',
    TASK_REVIEWED:         'Reviewed a task',
    README_EDIT_MINOR:     'Made a minor README edit',
    README_EDIT_MAJOR:     'Made a major README update',
    FILE_UPLOAD:           'Uploaded a file',
    FILE_UPDATE:           'Updated a file',
    DOCUMENTATION_UPLOAD:  'Uploaded documentation',
    DISCUSSION_POSTED:     'Started a discussion thread',
    DISCUSSION_REPLY:      'Replied to a discussion',
    MILESTONE_SUBMITTED:   'Submitted a milestone',
    MILESTONE_REVISED:     'Revised a milestone submission',
    GITHUB_COMMIT:         'Pushed a commit to GitHub',
    GITHUB_PR_OPENED:      'Opened a pull request',
    GITHUB_PR_MERGED:      'Merged a pull request',
    GITHUB_ISSUE_COMMENT:  'Commented on a GitHub issue',
  };
  return map[eventType] || eventType;
}
