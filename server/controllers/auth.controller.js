import { z } from 'zod';
import User from '../models/User.js';
import { clearTokenCookie, generateToken, setTokenCookie } from '../utils/token.js';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'faculty']),
  college: z.string().trim().min(2),
  department: z.string().trim().min(2),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  rollNo: z.string().trim().min(1).optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'student') {
    if (data.semester == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['semester'],
        message: 'Semester is required for students',
      });
    }
    if (!data.rollNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rollNo'],
        message: 'Roll number is required for students',
      });
    }
  }
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const payload = {
      ...data,
      email: data.email.toLowerCase(),
    };
    if (payload.role === 'faculty') {
      delete payload.semester;
      delete payload.rollNo;
    } else {
      payload.rollNo = payload.rollNo.toUpperCase();
    }

    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const user = await User.create(payload);
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  clearTokenCookie(res);
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  res.json({ user: sanitize(req.user) });
}

function sanitize(user) {
  const { _id, name, email, role, college, department, semester, rollNo, profilePicture, createdAt } = user;
  return { _id, name, email, role, college, department, semester, rollNo, profilePicture, createdAt };
}
