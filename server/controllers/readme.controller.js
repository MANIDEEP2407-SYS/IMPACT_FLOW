import ReadmeVersion from '../models/ReadmeVersion.js';
import Team          from '../models/Team.js';
import { idsEqual }  from '../utils/access.js';

/* ── helpers ── */
async function assertTeamReadAccess(teamId, user) {
  const team = await Team.findById(teamId).populate('course', 'faculty');
  if (!team) throw { status: 404, message: 'Team not found' };

  const isMember = team.members.some(m => String(m.user) === String(user._id));
  const isFacultyOwner = user.role === 'faculty' && idsEqual(team.course?.faculty, user._id);

  if (user.role === 'student' && !isMember) {
    throw { status: 403, message: 'Only team members can access this' };
  }
  if (user.role === 'faculty' && !isFacultyOwner) {
    throw { status: 403, message: 'Only the course faculty can access this team' };
  }
  if (user.role !== 'student' && user.role !== 'faculty') {
    throw { status: 403, message: 'Forbidden' };
  }

  return team;
}

/* GET /api/teams/:teamId/readme */
export async function getReadme(req, res, next) {
  try {
    const { teamId } = req.params;
    await assertTeamReadAccess(teamId, req.user);

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

    const team = await assertTeamReadAccess(teamId, req.user);

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
