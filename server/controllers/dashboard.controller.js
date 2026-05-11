import Project from '../models/Project.js';
import Team from '../models/Team.js';
import TaskLog from '../models/TaskLog.js';
import Milestone from '../models/Milestone.js';
import MilestoneSubmission from '../models/MilestoneSubmission.js';
import Course from '../models/Course.js';

export async function getProjectDashboard(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const course = await Course.findById(project.course._id);
    if (String(course.faculty) !== String(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    const teams = await Team.find({ project: project._id })
      .populate('teamLead', 'name email rollNo')
      .populate('members.user', 'name email rollNo');

    const milestones = await Milestone.find({ project: project._id }).sort('order');
    const milestoneIds = milestones.map(m => m._id);
    const allSubmissions = await MilestoneSubmission.find({ milestone: { $in: milestoneIds } });

    const result = await Promise.all(teams.map(async (team) => {
      const memberIds = team.members.map(m => String(m.user._id));
      const allTasks = await TaskLog.find({ team: team._id });

      const avgTasks = memberIds.length
        ? allTasks.length / memberIds.length
        : 1;

      const members = team.members.map(({ user }) => {
        const uid = String(user._id);
        const memberTasks = allTasks.filter(t => String(t.user) === uid);
        const taskCount = memberTasks.length;
        const totalHours = memberTasks.reduce((s, t) => s + t.hoursSpent, 0);
        const filesUploaded = memberTasks.reduce((s, t) => s + t.proofFiles.length, 0);
        const cs = team.contributionScores?.find(c => String(c.user) === uid);
        return {
          user,
          taskCount,
          totalHours,
          filesUploaded,
          contributionScore: cs?.score ?? 0,
        };
      });

      const milestoneStatus = milestones.map(m => {
        const sub = allSubmissions.find(
          s => String(s.milestone) === String(m._id) && String(s.team) === String(team._id)
        );
        return {
          milestoneId: m._id,
          title: m.title,
          order: m.order,
          dueDate: m.dueDate,
          submitted: !!sub,
          submittedAt: sub?.submittedAt || null,
          aiFlagScore: sub?.aiFlagScore ?? null,
        };
      });

      return { team: { id: team._id, name: team.name, status: team.status }, members, milestoneStatus };
    }));

    res.json({ project, milestones, teams: result });
  } catch (err) { next(err); }
}
