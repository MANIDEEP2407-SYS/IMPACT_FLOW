import Project from '../models/Project.js';
import Team from '../models/Team.js';
import TaskLog from '../models/TaskLog.js';
import Milestone from '../models/Milestone.js';
import MilestoneSubmission from '../models/MilestoneSubmission.js';
import Course from '../models/Course.js';
import ReadmeVersion from '../models/ReadmeVersion.js';
import CodeFile from '../models/CodeFile.js';
import { canAccessCourse, idsEqual } from '../utils/access.js';

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
          aiFlagDetails: sub?.aiFlagDetails ?? null,
        };
      });

      return { team: { id: team._id, name: team.name, status: team.status }, members, milestoneStatus };
    }));

    res.json({ project, milestones, teams: result });
  } catch (err) { next(err); }
}

export async function getProjectOverview(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const course = await Course.findById(project.course).populate('faculty', 'name email');
    if (!canAccessCourse(course, req.user))
      return res.status(403).json({ error: 'Forbidden' });

    const milestones = await Milestone.find({ project: project._id }).sort('order');
    const teams = await Team.find({ project: project._id })
      .populate('teamLead', 'name rollNo')
      .populate('members.user', 'name rollNo')
      .populate('course', 'name code');

    const userTeam = req.user.role === 'student'
      ? teams.find(team => team.members.some(member => idsEqual(member.user?._id || member.user, req.user._id)))
      : null;

    const teamIds = teams.map(team => team._id);
    const milestoneIds = milestones.map(ms => ms._id);
    const [tasks, submissions, readmeVersions, uploads] = await Promise.all([
      TaskLog.find({ team: { $in: teamIds } })
        .populate('user', 'name')
        .populate('milestone', 'title')
        .sort({ createdAt: -1 }),
      MilestoneSubmission.find({ milestone: { $in: milestoneIds } })
        .populate('submittedBy', 'name')
        .populate('team', 'name')
        .sort({ submittedAt: -1 }),
      ReadmeVersion.find({ project: project._id })
        .populate('editedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      CodeFile.find({ project: project._id })
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const userTeamMilestones = milestones.map(ms => {
      const teamSubmission = userTeam
        ? submissions.find(s => idsEqual(s.team?._id || s.team, userTeam._id) && idsEqual(s.milestone, ms._id))
        : null;
      const isOverdue = !teamSubmission && new Date(ms.dueDate) < new Date();
      return {
        milestoneId: ms._id,
        title: ms.title,
        dueDate: ms.dueDate,
        status: teamSubmission ? 'completed' : isOverdue ? 'overdue' : 'pending',
        submittedAt: teamSubmission?.submittedAt || null,
      };
    });

    const rankedMembers = (userTeam?.members || [])
      .map(member => {
        const score = (userTeam.contributionScores || [])
          .find(cs => idsEqual(cs.user, member.user?._id || member.user))?.score ?? 0;
        return { user: member.user, score };
      })
      .sort((a, b) => b.score - a.score);

    const latestReadme = readmeVersions[0]?.content || '';
    const workspaceSnapshot = {
      readmePreview: latestReadme.slice(0, 220),
      recentUploads: uploads.slice(0, 4).map(file => ({
        id: file._id,
        name: file.originalName,
        uploadedBy: file.uploadedBy?.name || 'Unknown',
        createdAt: file.createdAt,
      })),
      recentTasks: tasks.slice(0, 4).map(task => ({
        id: task._id,
        title: task.title,
        member: task.user?.name || 'Unknown',
        milestone: task.milestone?.title || '-',
        createdAt: task.createdAt,
      })),
    };

    const aiFlags = submissions.filter(s => (s.aiFlagScore || 0) >= 50).length;
    const analytics = {
      totalTasks: tasks.length,
      totalTeams: teams.length,
      totalSubmissions: submissions.length,
      aiFlags,
    };

    const activityFeed = [
      ...tasks.slice(0, 8).map(task => ({
        type: 'task',
        message: `${task.user?.name || 'A member'} logged "${task.title}"`,
        createdAt: task.createdAt,
      })),
      ...submissions.slice(0, 8).map(sub => ({
        type: 'milestone_submission',
        message: `${sub.submittedBy?.name || 'Team lead'} submitted milestone for ${sub.team?.name || 'team'}`,
        createdAt: sub.submittedAt,
      })),
      ...uploads.slice(0, 8).map(file => ({
        type: 'file_upload',
        message: `${file.uploadedBy?.name || 'A member'} uploaded ${file.originalName}`,
        createdAt: file.createdAt,
      })),
      ...readmeVersions.slice(0, 8).map(readme => ({
        type: 'readme_update',
        message: `${readme.editedBy?.name || 'A member'} updated README`,
        createdAt: readme.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 15);

    const latestMilestoneDueDate = milestones.length
      ? milestones.reduce((latest, milestone) => (
        new Date(milestone.dueDate) > new Date(latest) ? milestone.dueDate : latest
      ), milestones[0].dueDate)
      : null;

    res.json({
      projectInfo: {
        id: project._id,
        title: project.title,
        description: project.description,
        faculty: course.faculty ? { id: course.faculty._id, name: course.faculty.name, email: course.faculty.email } : null,
        course: { id: course._id, name: course.name, code: course.code },
        deadline: latestMilestoneDueDate,
      },
      teamOverview: {
        team: userTeam ? { id: userTeam._id, name: userTeam.name, status: userTeam.status } : null,
        lead: userTeam?.teamLead || null,
        members: userTeam?.members || [],
        ranking: rankedMembers,
      },
      milestoneTracker: userTeamMilestones,
      workspaceSnapshot,
      analytics,
      activityFeed,
    });
  } catch (err) { next(err); }
}
