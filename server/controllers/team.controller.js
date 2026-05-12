import { z } from 'zod';
import Team    from '../models/Team.js';
import Project from '../models/Project.js';
import Course  from '../models/Course.js';
import User    from '../models/User.js';
import { createNotification, notifyMany } from '../utils/notify.js';
import { calcProjectSimilarity }           from '../utils/similarity.js';

export async function createTeam(req, res, next) {
  try {
    const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);
    if (!course.students.includes(req.user._id))
      return res.status(403).json({ error: 'You are not enrolled in this course' });

    const existing = await Team.findOne({ project: project._id, 'members.user': req.user._id });
    if (existing) return res.status(409).json({ error: 'Already in a team for this project' });

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

    const course = await Course.findById(team.course);
    if (!course.students.includes(req.user._id))
      return res.status(403).json({ error: 'Not enrolled in course' });

    /* Section restriction */
    if (course.section && team.section && course.section !== team.section)
      return res.status(403).json({ error: 'You can only join teams in your section' });

    const project = await Project.findById(team.project);
    if (team.members.length >= project.teamSize.max)
      return res.status(400).json({ error: 'Team is full' });

    const inAnotherTeam = await Team.findOne({ project: team.project, 'members.user': req.user._id });
    if (inAnotherTeam) return res.status(409).json({ error: 'Already in a team for this project' });

    team.members.push({ user: req.user._id });
    await team.save();

    await createNotification({
      userId:  team.teamLead,
      type:    'join_request',
      message: `${req.user.name} requested to join your team "${team.name}".`,
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
    const teams = await Team.find({ project: req.params.projectId })
      .populate('teamLead', 'name email rollNo')
      .populate('members.user', 'name email rollNo');
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
      .populate('members.user', 'name email role rollNo')
      .populate('project', 'title description')
      .populate('course', 'name code section semester');

    if (!team) return res.status(404).json({ error: 'Team not found' });

    /* Access: member or faculty */
    const isMember = team.members.some(m => String(m.user?._id) === String(req.user._id));
    const isFaculty = req.user.role === 'faculty';
    if (!isMember && !isFaculty)
      return res.status(403).json({ error: 'Access denied' });

    res.json({ team });
  } catch (err) { next(err); }
}

/* POST /api/projects/:projectId/random-teams  (faculty only) */
export async function generateRandomTeams(req, res, next) {
  try {
    const { teamSize = 4 } = z.object({ teamSize: z.number().min(1).max(10) }).parse(req.body);
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course._id);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    /* Shuffle enrolled students */
    const students = [...course.students].sort(() => Math.random() - 0.5);
    const createdTeams = [];
    let groupIdx = 1;

    for (let i = 0; i < students.length; i += teamSize) {
      const chunk   = students.slice(i, i + teamSize);
      const leadId  = chunk[0];
      const teamName = `Auto Team ${groupIdx++}`;

      const team = await Team.create({
        name:     teamName,
        project:  project._id,
        course:   course._id,
        section:  course.section || '',
        teamLead: leadId,
        status:   'pending',
        members:  chunk.map(u => ({ user: u })),
      });

      createdTeams.push(team);
    }

    res.status(201).json({ teams: createdTeams, count: createdTeams.length });
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
