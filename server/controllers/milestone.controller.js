import { z } from 'zod';
import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import Course from '../models/Course.js';
import { canAccessCourse } from '../utils/access.js';

const milestoneSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string()),
  order: z.number().min(1),
});

async function assertFacultyOwnsProject(projectId, userId) {
  const project = await Project.findById(projectId).populate('course');
  if (!project) return null;
  const course = await Course.findOne({ _id: project.course._id, faculty: userId });
  return course ? project : null;
}

export async function createMilestone(req, res, next) {
  try {
    const data = milestoneSchema.parse(req.body);
    const project = await assertFacultyOwnsProject(req.params.projectId, req.user._id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const milestone = await Milestone.create({ ...data, project: req.params.projectId });
    res.status(201).json({ milestone });
  } catch (err) { next(err); }
}

export async function getMilestones(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!canAccessCourse(project.course, req.user))
      return res.status(403).json({ error: 'Forbidden' });

    const milestones = await Milestone.find({ project: req.params.projectId }).sort('order');
    res.json({ milestones });
  } catch (err) { next(err); }
}

export async function getMilestoneById(req, res, next) {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    const project = await Project.findById(milestone.project).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!canAccessCourse(project.course, req.user))
      return res.status(403).json({ error: 'Forbidden' });

    res.json({ milestone });
  } catch (err) { next(err); }
}

export async function updateMilestone(req, res, next) {
  try {
    const data = milestoneSchema.partial().parse(req.body);
    const milestone = await Milestone.findById(req.params.id).populate('project');
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    const project = await assertFacultyOwnsProject(milestone.project._id, req.user._id);
    if (!project) return res.status(403).json({ error: 'Forbidden' });
    Object.assign(milestone, data);
    await milestone.save();
    res.json({ milestone });
  } catch (err) { next(err); }
}
