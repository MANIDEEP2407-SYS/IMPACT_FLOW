import ReadmeVersion from '../models/ReadmeVersion.js';
import Team          from '../models/Team.js';

/* ── helpers ── */
async function assertMember(teamId, userId) {
  const team = await Team.findById(teamId);
  if (!team) throw { status: 404, message: 'Team not found' };
  const isMember = team.members.some(m => String(m.user) === String(userId));
  if (!isMember) throw { status: 403, message: 'Only team members can access this' };
  return team;
}

/* GET /api/teams/:teamId/readme */
export async function getReadme(req, res, next) {
  try {
    const { teamId } = req.params;

    /* Faculty can view any team's readme */
    if (req.user.role === 'student') await assertMember(teamId, req.user._id);

    const versions = await ReadmeVersion.find({ team: teamId })
      .sort('-versionNumber')
      .populate('editedBy', 'name role');

    const latest = versions[0] || null;
    res.json({ latest, history: versions });
  } catch (err) { next(err); }
}

/* POST /api/teams/:teamId/readme */
export async function saveReadme(req, res, next) {
  try {
    const { teamId } = req.params;
    const { content, summary = '' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    await assertMember(teamId, req.user._id);

    /* Fetch project from team */
    const team = await Team.findById(teamId);

    /* Calculate next version number */
    const last = await ReadmeVersion.findOne({ team: teamId }).sort('-versionNumber');
    const versionNumber = last ? last.versionNumber + 1 : 1;

    const version = await ReadmeVersion.create({
      team:    teamId,
      project: team.project,
      content,
      editedBy: req.user._id,
      versionNumber,
      summary,
    });

    await version.populate('editedBy', 'name role');
    res.status(201).json({ version });
  } catch (err) { next(err); }
}
