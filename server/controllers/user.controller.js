import mongoose from 'mongoose';
import { z } from 'zod';
import User from '../models/User.js';
import Team from '../models/Team.js';
import TaskLog from '../models/TaskLog.js';
import MilestoneSubmission from '../models/MilestoneSubmission.js';

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  skills: z.array(z.string().trim().max(50)).max(20).optional(),
  domains: z.array(z.string().trim().max(50)).max(20).optional(),
  techStack: z.array(z.string().trim().max(50)).max(20).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  timezone: z.string().max(100).optional(),
});

function toUserId(value) {
  return typeof value === 'string' ? value : String(value?._id || value);
}

function reputationBadge({ contributionAverage, leadCount, tasksCompleted }) {
  if (contributionAverage >= 80) return 'Top Contributor';
  if (leadCount >= 1) return 'Team Lead';
  if (contributionAverage >= 50 || tasksCompleted >= 10) return 'Reliable Collaborator';
  return 'Emerging Contributor';
}

function canViewDetailedProfile(requestUser, targetUserId) {
  if (!requestUser) return false;
  if (String(requestUser._id) === String(targetUserId)) return true;
  return requestUser.role === 'faculty' || requestUser.role === 'admin';
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const data = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      data,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
}

export async function getUserProfile(req, res, next) {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (!canViewDetailedProfile(req.user, userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const teams = await Team.find({ 'members.user': user._id })
      .populate('project', 'title')
      .populate('course', 'name code')
      .populate('teamLead', 'name');

    const tasksCompleted = await TaskLog.countDocuments({ user: user._id });
    const milestonesSubmitted = await MilestoneSubmission.countDocuments({ submittedBy: user._id });

    const taskFileAgg = await TaskLog.aggregate([
      { $match: { user: user._id } },
      { $project: { count: { $size: { $ifNull: ['$proofFiles', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    const submissionFileAgg = await MilestoneSubmission.aggregate([
      { $match: { submittedBy: user._id } },
      { $project: { count: { $size: { $ifNull: ['$files', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    const filesUploaded = (taskFileAgg[0]?.total || 0) + (submissionFileAgg[0]?.total || 0);

    let contributionTotal = 0;
    let contributionCount = 0;
    let leadCount = 0;
    const projectIds = new Set();

    const teamHistory = teams.map(team => {
      const teamLeadId = toUserId(team.teamLead);
      const isLead = teamLeadId === String(user._id);
      if (isLead) leadCount += 1;
      if (team.project?._id) projectIds.add(String(team.project._id));

      const score = (team.contributionScores || [])
        .find(entry => String(entry.user) === String(user._id))?.score;

      if (typeof score === 'number') {
        contributionTotal += score;
        contributionCount += 1;
      }

      return {
        teamId: team._id,
        teamName: team.name,
        role: isLead ? 'lead' : 'member',
        status: team.status,
        project: team.project ? { id: team.project._id, title: team.project.title } : null,
        course: team.course ? { id: team.course._id, name: team.course.name, code: team.course.code } : null,
        joinedAt: team.createdAt,
        contributionScore: typeof score === 'number' ? score : null,
      };
    });

    const contributionAverage = contributionCount
      ? Math.round((contributionTotal / contributionCount) * 100) / 100
      : 0;

    const profile = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        semester: user.semester,
        rollNo: user.rollNo,
        profilePicture: user.profilePicture,
      },
      academic: {
        name: user.name,
        rollNo: user.rollNo || '',
        department: user.department || '',
        semester: user.semester || null,
      },
      technical: {
        bio: user.bio || '',
        skills: user.skills || [],
        domains: user.domains || [],
        techStack: user.techStack || [],
        github: user.github || '',
        linkedin: user.linkedin || '',
      },
      stats: {
        projectsParticipated: projectIds.size,
        tasksCompleted,
        contributionAverage,
        milestonesSubmitted,
        filesUploaded,
      },
      reputation: {
        badge: reputationBadge({ contributionAverage, leadCount, tasksCompleted }),
      },
      teamHistory,
    };

    res.json({ profile });
  } catch (err) { next(err); }
}
