import { z } from 'zod';
import Team    from '../models/Team.js';
import Project from '../models/Project.js';
import Course  from '../models/Course.js';
import User    from '../models/User.js';
import { arrayHasId, canAccessCourse, idsEqual } from '../utils/access.js';
import { createNotification, notifyMany } from '../utils/notify.js';
import { calcProjectSimilarity }           from '../utils/similarity.js';

const autoTeamSchema = z.object({
  teamSize: z.coerce.number().int().min(2).max(10).default(4),
  preview: z.boolean().optional().default(false),
  regenerate: z.boolean().optional().default(false),
});

const greekLabels = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
];

function buildAutoTeamName(index) {
  const padded = String(index + 1).padStart(2, '0');
  if (index < greekLabels.length) return `Team ${greekLabels[index]}`;
  return `IF-TEAM-${padded}`;
}

function splitBalanced(studentIds, teamSize) {
  const chunks = [];
  for (let i = 0; i < studentIds.length; i += teamSize) {
    chunks.push(studentIds.slice(i, i + teamSize));
  }

  // Avoid one-person last team by borrowing one member from the previous chunk.
  if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
    const previous = chunks[chunks.length - 2];
    const borrowed = previous.pop();
    if (borrowed) chunks[chunks.length - 1].unshift(borrowed);
  }

  return chunks.filter(group => group.length > 0);
}

export async function createTeam(req, res, next) {
  try {
    const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);
    if (!arrayHasId(course.students, req.user._id))
      return res.status(403).json({ error: 'You are not enrolled in this course' });

    const existing = await Team.findOne({ project: project._id, 'members.user': req.user._id });
    if (existing) return res.status(409).json({ error: 'Already in a team for this project' });
    const existingRequest = await Team.findOne({
      project: project._id,
      joinRequests: { $elemMatch: { student: req.user._id, status: 'pending' } },
    });
    if (existingRequest) return res.status(409).json({ error: 'You already have a pending join request' });

    const team = await Team.create({
      name,
      project:  project._id,
      course:   course._id,
      section:  course.section || '',
      teamLead: req.user._id,
      members:  [{ user: req.user._id }],
    });

    await createNotification({
      userId:  course.faculty,
      type:    'join_request',
      message: `Team "${name}" created for project "${project.title}" — awaiting your approval.`,
    });

    res.status(201).json({ team });
  } catch (err) { next(err); }
}

export async function joinRequest(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId).populate({ path: 'project', populate: 'course' });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.status !== 'pending')
      return res.status(400).json({ error: 'Team is no longer accepting join requests' });

    const course = await Course.findById(team.course);
    if (!arrayHasId(course.students, req.user._id))
      return res.status(403).json({ error: 'Not enrolled in course' });

    /* Section restriction */
    if (course.section && team.section && course.section !== team.section)
      return res.status(403).json({ error: 'You can only join teams in your section' });

    const project = await Project.findById(team.project);
    if (team.members.length >= project.teamSize.max)
      return res.status(400).json({ error: 'Team is full' });

    const inAnotherTeam = await Team.findOne({ project: team.project, 'members.user': req.user._id });
    if (inAnotherTeam) return res.status(409).json({ error: 'Already in a team for this project' });

    const existingPending = await Team.findOne({
      project: team.project,
      joinRequests: { $elemMatch: { student: req.user._id, status: 'pending' } },
    });
    if (existingPending) return res.status(409).json({ error: 'You already have a pending join request' });

    const ownReq = (team.joinRequests || []).find(r => idsEqual(r.student, req.user._id));
    if (ownReq?.status === 'pending')
      return res.status(409).json({ error: 'Join request already sent' });

    if (ownReq && ownReq.status !== 'pending') {
      ownReq.status = 'pending';
      ownReq.requestedAt = new Date();
      ownReq.respondedAt = null;
    } else {
      team.joinRequests = team.joinRequests || [];
      team.joinRequests.push({ student: req.user._id, status: 'pending' });
    }
    await team.save();

    const notifyIds = [team.teamLead, course.faculty].filter((id, idx, arr) =>
      arr.findIndex(other => String(other) === String(id)) === idx
    );
    await notifyMany({
      userIds: notifyIds,
      type:    'join_request',
      message: `${req.user.name} requested to join team "${team.name}".`,
    });

    res.json({ team });
  } catch (err) { next(err); }
}

export async function approveTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId).populate({ path: 'project', populate: 'course' });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const course = await Course.findById(team.course);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    const maxSize = team.project?.teamSize?.max || 5;
    const now = new Date();
    for (const request of team.joinRequests || []) {
      if (request.status !== 'pending') continue;

      const alreadyMember = team.members.some(m => idsEqual(m.user, request.student));
      if (alreadyMember) {
        request.status = 'approved';
        request.respondedAt = now;
        continue;
      }

      if (team.members.length >= maxSize) {
        request.status = 'rejected';
        request.respondedAt = now;
        continue;
      }

      team.members.push({ user: request.student });
      request.status = 'approved';
      request.respondedAt = now;
    }

    team.status = 'active';
    await team.save();
    await notifyMany({
      userIds: team.members.map(m => m.user),
      type:    'team_approved',
      message: `Your team "${team.name}" has been approved!`,
    });
    res.json({ team });
  } catch (err) { next(err); }
}

export async function rejectTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId).populate({ path: 'project', populate: 'course' });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const course = await Course.findById(team.course);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    const now = new Date();
    for (const request of team.joinRequests || []) {
      if (request.status === 'pending') {
        request.status = 'rejected';
        request.respondedAt = now;
      }
    }
    team.status = 'rejected';
    await team.save();
    await notifyMany({
      userIds: team.members.map(m => m.user),
      type:    'team_rejected',
      message: `Your team "${team.name}" was not approved. Please contact your faculty.`,
    });
    res.json({ team });
  } catch (err) { next(err); }
}

export async function getProjectTeams(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const course = await Course.findById(project.course);
    if (!canAccessCourse(course, req.user))
      return res.status(403).json({ error: 'Forbidden' });

    const teams = await Team.find({ project: req.params.projectId })
      .populate('teamLead', 'name email rollNo')
      .populate('members.user', 'name email rollNo')
      .populate('joinRequests.student', 'name email rollNo');

    if (req.user.role === 'student') {
      const userId = String(req.user._id);
      const sanitized = teams.map(team => {
        const plain = team.toObject();
        plain.joinRequests = (plain.joinRequests || []).filter(request =>
          idsEqual(request.student?._id ?? request.student, userId)
        );
        return plain;
      });
      return res.json({ teams: sanitized });
    }

    res.json({ teams });
  } catch (err) { next(err); }
}

export async function removeMember(req, res, next) {
  try {
    const { userId } = z.object({ userId: z.string() }).parse(req.body);
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (String(team.teamLead) !== String(req.user._id))
      return res.status(403).json({ error: 'Only team lead can remove members' });
    if (team.status === 'active')
      return res.status(400).json({ error: 'Cannot remove members after team is approved' });
    team.members = team.members.filter(m => String(m.user) !== userId);
    await team.save();
    res.json({ team });
  } catch (err) { next(err); }
}

/* GET /api/teams/:teamId/workspace  — team info + members + tasks overview */
export async function getWorkspace(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('teamLead', 'name email role')
      .populate('members.user', 'name email role rollNo bio skills domains techStack github linkedin')
      .populate('project', 'title description')
      .populate('course', 'name code section semester faculty');

    if (!team) return res.status(404).json({ error: 'Team not found' });

    /* Access: member or faculty */
    const isMember = team.members.some(m => String(m.user?._id) === String(req.user._id));
    const isFaculty = req.user.role === 'faculty' && idsEqual(team.course?.faculty, req.user._id);
    if (!isMember && !isFaculty)
      return res.status(403).json({ error: 'Access denied' });

    res.json({ team });
  } catch (err) { next(err); }
}

/* POST /api/projects/:projectId/auto-form-teams  (faculty only) */
export async function generateRandomTeams(req, res, next) {
  try {
    const { teamSize, preview, regenerate } = autoTeamSchema.parse(req.body);
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    if (regenerate) {
      await Team.deleteMany({
        project: project._id,
        status: 'pending',
        isAutoGenerated: true,
      });
    }

    const existingTeams = await Team.find({
      project: project._id,
      status: { $in: ['pending', 'active'] },
    }).select('members');

    const assignedStudentIds = new Set(
      existingTeams.flatMap(team => team.members.map(member => String(member.user)))
    );

    const eligibleStudents = course.students.filter(
      studentId => !assignedStudentIds.has(String(studentId))
    );

    if (eligibleStudents.length < 2) {
      return res.status(400).json({
        error: 'Not enough unassigned students available for auto team formation',
      });
    }

    const shuffled = [...eligibleStudents].sort(() => Math.random() - 0.5);
    const groups = splitBalanced(shuffled, teamSize);
    const profiles = await User.find({ _id: { $in: eligibleStudents } })
      .select('name email rollNo department semester');
    const profileMap = new Map(profiles.map(profile => [String(profile._id), profile]));

    const teamsPreview = groups.map((group, index) => {
      const memberProfiles = group.map(memberId => profileMap.get(String(memberId))).filter(Boolean);
      return {
        name: buildAutoTeamName(index),
        teamLead: memberProfiles[0] || null,
        members: memberProfiles,
      };
    });

    if (preview) {
      return res.json({
        preview: true,
        teamsCreated: 0,
        eligibleStudents: eligibleStudents.length,
        teamsPreview,
      });
    }

    const createdTeams = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const team = await Team.create({
        name: buildAutoTeamName(i),
        project: project._id,
        course: course._id,
        section: course.section || '',
        teamLead: group[0],
        status: 'pending',
        isAutoGenerated: true,
        generatedAt: new Date(),
        generatedBy: req.user._id,
        members: group.map(userId => ({ user: userId })),
      });
      createdTeams.push(team);
    }

    res.status(201).json({
      preview: false,
      teamsCreated: createdTeams.length,
      eligibleStudents: eligibleStudents.length,
      teamsPreview,
      teams: createdTeams,
    });
  } catch (err) { next(err); }
}

export async function approveAllAutoTeams(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    const teams = await Team.find({
      project: project._id,
      status: 'pending',
      isAutoGenerated: true,
    });

    if (!teams.length) {
      return res.status(400).json({ error: 'No pending auto-generated teams found' });
    }

    const notifyIds = new Set();
    for (const team of teams) {
      team.status = 'active';
      await team.save();
      team.members.forEach(member => notifyIds.add(String(member.user)));
    }

    if (notifyIds.size) {
      await notifyMany({
        userIds: [...notifyIds],
        type: 'team_approved',
        message: `Auto-formed teams for "${project.title}" were approved by faculty.`,
      });
    }

    res.json({ approvedTeams: teams.length });
  } catch (err) { next(err); }
}

/* GET /api/projects/:projectId/similarity */
export async function getSimilarityReport(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Only faculty can view similarity report' });

    const results = await calcProjectSimilarity(req.params.projectId);
    res.json({ results });
  } catch (err) { next(err); }
}
