import { z } from 'zod';
import TeamInvite from '../models/TeamInvite.js';
import Team      from '../models/Team.js';
import Project   from '../models/Project.js';
import Course    from '../models/Course.js';
import User      from '../models/User.js';
import { idsEqual, arrayHasId }       from '../utils/access.js';
import { createNotification } from '../utils/notify.js';

const inviteSchema = z.object({
  receiverId: z.string().min(1),
});

/* POST /api/teams/:teamId/invite  — team lead sends invite */
export async function sendInvite(req, res, next) {
  try {
    const { receiverId } = inviteSchema.parse(req.body);
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    /* Only team lead can invite */
    if (!idsEqual(team.teamLead, req.user._id))
      return res.status(403).json({ error: 'Only the team lead can send invites' });

    if (team.status !== 'pending')
      return res.status(400).json({ error: 'Cannot invite to an already approved/rejected team' });

    /* Check receiver exists & is student */
    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.role !== 'student')
      return res.status(404).json({ error: 'Student not found' });

    /* Check receiver is enrolled in course */
    const course = await Course.findById(team.course);
    if (!arrayHasId(course.students, receiverId))
      return res.status(400).json({ error: 'Student is not enrolled in this course' });

    /* Check not already a team member */
    if (team.members.some(m => idsEqual(m.user, receiverId)))
      return res.status(409).json({ error: 'Student is already a team member' });

    /* Check not already in another approved team */
    const inOtherTeam = await Team.findOne({
      project: team.project,
      'members.user': receiverId,
      status: { $in: ['pending', 'active'] },
    });
    if (inOtherTeam)
      return res.status(409).json({ error: 'Student is already in a team for this project' });

    /* Check max team size */
    const project = await Project.findById(team.project);
    if (team.members.length >= (project?.teamSize?.max || 5))
      return res.status(400).json({ error: 'Team is already at max capacity' });

    /* Check duplicate pending invite */
    const dup = await TeamInvite.findOne({ team: team._id, receiver: receiverId, status: 'pending' });
    if (dup) return res.status(409).json({ error: 'Invite already sent to this student' });

    const invite = await TeamInvite.create({
      sender:  req.user._id,
      receiver: receiverId,
      team:    team._id,
      project: team.project,
    });

    await createNotification({
      userId: receiverId,
      type:   'team_invite',
      message: `${req.user.name} invited you to join team "${team.name}".`,
    });

    res.status(201).json({ invite });
  } catch (err) { next(err); }
}

/* PUT /api/invites/:inviteId/accept */
export async function acceptInvite(req, res, next) {
  try {
    const invite = await TeamInvite.findById(req.params.inviteId);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (!idsEqual(invite.receiver, req.user._id))
      return res.status(403).json({ error: 'This invite is not for you' });
    if (invite.status !== 'pending')
      return res.status(400).json({ error: `Invite already ${invite.status}` });

    const team = await Team.findById(invite.team);
    if (!team) return res.status(404).json({ error: 'Team no longer exists' });

    /* Re-check max size */
    const project = await Project.findById(team.project);
    if (team.members.length >= (project?.teamSize?.max || 5)) {
      invite.status = 'rejected';
      await invite.save();
      return res.status(400).json({ error: 'Team is now full' });
    }

    /* Re-check not already in another team */
    const inOtherTeam = await Team.findOne({
      project: team.project,
      'members.user': req.user._id,
    });
    if (inOtherTeam) {
      invite.status = 'rejected';
      await invite.save();
      return res.status(409).json({ error: 'You are already in a team for this project' });
    }

    /* Add member to team */
    team.members.push({ user: req.user._id });
    await team.save();

    invite.status = 'accepted';
    await invite.save();

    /* Reject all other pending invites for this project for this student */
    await TeamInvite.updateMany(
      { receiver: req.user._id, project: invite.project, status: 'pending', _id: { $ne: invite._id } },
      { status: 'rejected' }
    );

    await createNotification({
      userId: invite.sender,
      type:   'invite_accepted',
      message: `${req.user.name} accepted your invite to join "${team.name}".`,
    });

    res.json({ invite, team });
  } catch (err) { next(err); }
}

/* PUT /api/invites/:inviteId/reject */
export async function rejectInvite(req, res, next) {
  try {
    const invite = await TeamInvite.findById(req.params.inviteId);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (!idsEqual(invite.receiver, req.user._id))
      return res.status(403).json({ error: 'This invite is not for you' });
    if (invite.status !== 'pending')
      return res.status(400).json({ error: `Invite already ${invite.status}` });

    invite.status = 'rejected';
    await invite.save();

    await createNotification({
      userId: invite.sender,
      type:   'invite_rejected',
      message: `${req.user.name} declined your invite to join team "${(await Team.findById(invite.team))?.name}".`,
    });

    res.json({ invite });
  } catch (err) { next(err); }
}

/* GET /api/invites/my  — received invites for current student */
export async function getMyInvites(req, res, next) {
  try {
    const invites = await TeamInvite.find({ receiver: req.user._id })
      .populate('sender', 'name email rollNo')
      .populate('team', 'name')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.json({ invites });
  } catch (err) { next(err); }
}

/* GET /api/teams/:teamId/invites  — sent invites for a team */
export async function getTeamInvites(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!idsEqual(team.teamLead, req.user._id))
      return res.status(403).json({ error: 'Only team lead can view sent invites' });

    const invites = await TeamInvite.find({ team: team._id })
      .populate('receiver', 'name email rollNo')
      .sort({ createdAt: -1 });
    res.json({ invites });
  } catch (err) { next(err); }
}

/* GET /api/projects/:projectId/eligible-students — students not in a team yet */
export async function getEligibleStudents(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);

    /* Get all students already in teams for this project */
    const teams = await Team.find({ project: project._id, status: { $in: ['pending', 'active'] } }).select('members');
    const assignedIds = new Set(teams.flatMap(t => t.members.map(m => String(m.user))));

    /* Get eligible students */
    const students = await User.find({
      _id: { $in: course.students },
      role: 'student',
    }).select('name email rollNo department semester skills');

    const eligible = students.filter(s => !assignedIds.has(String(s._id)));

    /* Also filter search query if provided */
    const q = (req.query.q || '').toLowerCase().trim();
    const filtered = q
      ? eligible.filter(s =>
          s.name.toLowerCase().includes(q) ||
          (s.rollNo || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q)
        )
      : eligible;

    res.json({ students: filtered });
  } catch (err) { next(err); }
}
