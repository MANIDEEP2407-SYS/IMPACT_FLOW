import MilestoneSubmission from '../models/MilestoneSubmission.js';
import Milestone from '../models/Milestone.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import { getAIFlagScore, getAIFlagDetails } from '../utils/aiFlag.js';
import { notifyMany } from '../utils/notify.js';

export async function submitMilestone(req, res, next) {
  try {
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    if (new Date() > new Date(milestone.dueDate))
      return res.status(400).json({ error: 'Submission deadline has passed' });

    const team = await Team.findOne({ 'members.user': req.user._id, project: milestone.project, status: 'active' });
    if (!team) return res.status(403).json({ error: 'You must be in an active team' });
    if (String(team.teamLead) !== String(req.user._id))
      return res.status(403).json({ error: 'Only the team lead can submit' });

    const files = (req.files || []).map(f => ({
      url: f.path,
      publicId: f.filename,
      uploadedBy: req.user._id,
    }));

    const notes = req.body.notes || '';
    const aiFlagScore = getAIFlagScore(notes);
    const aiFlagDetails = getAIFlagDetails(aiFlagScore);

    const submission = await MilestoneSubmission.create({
      team: team._id,
      milestone: milestone._id,
      submittedBy: req.user._id,
      files,
      notes,
      aiFlagScore,
      aiFlagDetails,
    });

    await notifyMany({
      userIds: team.members.map(m => m.user),
      type: 'submission',
      message: `Milestone "${milestone.title}" submitted successfully.`,
    });

    res.status(201).json({ submission });
  } catch (err) { next(err); }
}

export async function getMilestoneSubmission(req, res, next) {
  try {
    const submission = await MilestoneSubmission.findOne({ milestone: req.params.milestoneId })
      .populate('team', 'name')
      .populate('submittedBy', 'name');
    res.json({ submission });
  } catch (err) { next(err); }
}

export async function getProjectSubmissions(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const milestones = await (await import('../models/Milestone.js')).default.find({ project: project._id });
    const milestoneIds = milestones.map(m => m._id);
    const submissions = await MilestoneSubmission.find({ milestone: { $in: milestoneIds } })
      .populate('team', 'name')
      .populate('milestone', 'title order dueDate')
      .populate('submittedBy', 'name');
    res.json({ submissions });
  } catch (err) { next(err); }
}
