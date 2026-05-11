import { z } from 'zod';
import Project from '../models/Project.js';
import Course from '../models/Course.js';

const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['group', 'capstone']).default('group'),
  teamSize: z.object({ min: z.number().min(1), max: z.number().min(1) }).optional(),
  rubric: z.array(z.object({ criteria: z.string(), weight: z.number() })).optional(),
  totalMarks: z.number().optional(),
});

export async function createProject(req, res, next) {
  try {
    const data = projectSchema.parse(req.body);
    if (data.rubric) {
      const total = data.rubric.reduce((s, r) => s + r.weight, 0);
      if (Math.round(total) !== 100)
        return res.status(400).json({ error: 'Rubric weights must sum to 100' });
    }
    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const project = await Project.create({ ...data, course: req.params.courseId });
    res.status(201).json({ project });
  } catch (err) { next(err); }
}

export async function getCourseProjects(req, res, next) {
  try {
    const projects = await Project.find({ course: req.params.courseId });
    res.json({ projects });
  } catch (err) { next(err); }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
}
