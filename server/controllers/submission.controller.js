import MilestoneSubmission from '../models/MilestoneSubmission.js';
import Milestone from '../models/Milestone.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import Course from '../models/Course.js';
import { getAIFlagScore, getAIFlagDetails } from '../utils/aiFlag.js';
import { notifyMany } from '../utils/notify.js';
import { idsEqual } from '../utils/access.js';
import { emitContributionEvent } from '../utils/eventEmitter.js';

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

    const existing = await MilestoneSubmission.findOne({ team: team._id, milestone: milestone._id });
    if (existing) return res.status(409).json({ error: 'Milestone already submitted' });

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

    // Emit MILESTONE_SUBMITTED for team lead
    await emitContributionEvent({
      userId:    req.user._id,
      projectId: milestone.project,
      teamId:    team._id,
      sourceType: 'MILESTONE',
      eventType:  'MILESTONE_SUBMITTED',
      referenceId: submission._id,
      referenceModel: 'MilestoneSubmission',
      metadata: {
        description: `Submitted milestone: "${milestone.title}"`,
        wordCount: notes.split(/\s+/).filter(Boolean).length,
      },
    });

    res.status(201).json({ submission });
  } catch (err) { next(err); }
}

export async function getMilestoneSubmission(req, res, next) {
  try {
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    const project = await Project.findById(milestone.project);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const query = { milestone: milestone._id };

    if (req.user.role === 'faculty') {
      if (!idsEqual(course.faculty, req.user._id))
        return res.status(403).json({ error: 'Forbidden' });
      if (req.query.teamId) query.team = req.query.teamId;
    } else {
      const ownTeam = await Team.findOne({ project: project._id, 'members.user': req.user._id });
      if (!ownTeam) return res.status(403).json({ error: 'Forbidden' });
      query.team = ownTeam._id;
    }

    const submission = await MilestoneSubmission.findOne(query)
      .populate('team', 'name')
      .populate('submittedBy', 'name')
      .sort('-submittedAt');

    if (!submission) return res.json({ submission: null });

    if (req.user.role !== 'faculty') {
      const sanitized = submission.toObject();
      delete sanitized.aiFlagScore;
      delete sanitized.aiFlagDetails;
      return res.json({ submission: sanitized });
    }

    res.json({ submission });
  } catch (err) { next(err); }
}

export async function getProjectSubmissions(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const course = await Course.findById(project.course);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!idsEqual(course.faculty, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    const milestones = await Milestone.find({ project: project._id });
    const milestoneIds = milestones.map(m => m._id);
    const submissions = await MilestoneSubmission.find({ milestone: { $in: milestoneIds } })
      .populate('team', 'name')
      .populate('milestone', 'title order dueDate')
      .populate('submittedBy', 'name');
    res.json({ submissions });
  } catch (err) { next(err); }
}
