import { z } from 'zod';
import Course from '../models/Course.js';
import { generateUniqueJoinCode } from '../utils/joinCode.js';

const courseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  semester: z.number().min(1).max(8),
  section: z.string().optional(),
  department: z.string().min(2),
});

export async function createCourse(req, res, next) {
  try {
    const data = courseSchema.parse(req.body);
    const joinCode = await generateUniqueJoinCode();
    const course = await Course.create({ ...data, faculty: req.user._id, joinCode });
    res.status(201).json({ course });
  } catch (err) { next(err); }
}

export async function getMyCourses(req, res, next) {
  try {
    const courses = await Course.find({ faculty: req.user._id }).populate('faculty', 'name email');
    res.json({ courses });
  } catch (err) { next(err); }
}

export async function joinCourse(req, res, next) {
  try {
    const { joinCode } = z.object({ joinCode: z.string().length(6) }).parse(req.body);
    const course = await Course.findOne({ joinCode: joinCode.toUpperCase() });
    if (!course) return res.status(404).json({ error: 'Invalid join code' });
    if (course.students.includes(req.user._id))
      return res.status(409).json({ error: 'Already enrolled' });
    course.students.push(req.user._id);
    await course.save();
    res.json({ course });
  } catch (err) { next(err); }
}

export async function getEnrolledCourses(req, res, next) {
  try {
    const courses = await Course.find({ students: req.user._id }).populate('faculty', 'name email');
    res.json({ courses });
  } catch (err) { next(err); }
}
