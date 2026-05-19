import { z } from 'zod';
import TaskLog from '../models/TaskLog.js';
import Team from '../models/Team.js';
import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import Course from '../models/Course.js';
import { calcContributionScore } from '../utils/contribution.js';
import { idsEqual } from '../utils/access.js';

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  hoursSpent: z.number().min(0),
  milestoneId: z.string(),
  date: z.string(),
});

export async function createTask(req, res, next) {
  try {
    const data = taskSchema.parse({
      ...req.body,
      hoursSpent: Number(req.body.hoursSpent),
    });
    const milestone = await Milestone.findById(data.milestoneId);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    const team = await Team.findOne({
      'members.user': req.user._id,
      project: milestone.project,
      status: 'active',
    });
    if (!team) return res.status(400).json({ error: 'You must be in an active team to log tasks' });

    const proofFiles = (req.files || []).map(f => ({
      url: f.path,
      publicId: f.filename,
      filename: f.originalname,
    }));

    const task = await TaskLog.create({
      user: req.user._id,
      team: team._id,
      milestone: data.milestoneId,
      title: data.title,
      description: data.description,
      proofFiles,
      hoursSpent: data.hoursSpent,
      date: new Date(data.date),
    });

    await recalcContribution(team._id);
    res.status(201).json({ task });
  } catch (err) { next(err); }
}

export async function getMyTasks(req, res, next) {
  try {
    const query = { user: req.user._id };
    if (req.query.milestoneId) query.milestone = req.query.milestoneId;
    const tasks = await TaskLog.find(query).sort('-date').populate('milestone', 'title');
    res.json({ tasks });
  } catch (err) { next(err); }
}

export async function getTeamTasks(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const project = await Project.findById(team.project);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const course = await Course.findById(project.course);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const isMember = team.members.some(m => idsEqual(m.user, req.user._id));
    const isFacultyOwner = req.user.role === 'faculty' && idsEqual(course.faculty, req.user._id);
    if (!isMember && !isFacultyOwner)
      return res.status(403).json({ error: 'Forbidden' });

    const tasks = await TaskLog.find({ team: req.params.teamId })
      .sort('-date')
      .populate('user', 'name rollNo')
      .populate('milestone', 'title order');
    res.json({ tasks });
  } catch (err) { next(err); }
}

async function recalcContribution(teamId) {
  const team = await Team.findById(teamId);
  if (!team) return;
  const allTasks = await TaskLog.find({ team: teamId });

  const memberIds = team.members.map(m => String(m.user));
  const teamTotals = memberIds.map(uid => {
    const memberTasks = allTasks.filter(t => String(t.user) === uid);
    return {
      uid,
      taskCount: memberTasks.length,
      totalHours: memberTasks.reduce((s, t) => s + t.hoursSpent, 0),
      filesUploaded: memberTasks.reduce((s, t) => s + t.proofFiles.length, 0),
    };
  });

  const avgTasks = teamTotals.reduce((s, m) => s + m.taskCount, 0) / Math.max(memberIds.length, 1);

  team.contributionScores = teamTotals.map(m => ({
    user: m.uid,
    score: calcContributionScore(m.taskCount, m.totalHours, m.filesUploaded, avgTasks),
  }));
  await team.save();
}
